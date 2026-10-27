#!/usr/bin/env node
// Prints a clean outline of one saved page of the current site: headings, paragraphs, lists,
// tables row by row, verse blocks, reference lines, and links with their targets.
//
//   node scripts/content/extract.mjs <slug | address>     the outline, as text
//   node scripts/content/extract.mjs <slug> --json        the same outline, as JSON
//
// It reads the saved copies only from $CARE4MIND_CAPTURES, never writes into the repo and never
// touches the network. The rules for using it are in docs/agents/content-migration.md.
//
// Plain Node, no dependencies. This file is also the captures module the other tools import:
// `openCaptures()` is the one place any tool reads a saved page.

import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** A problem the person running a tool can fix: printed as it is, with exit code 2. */
export class ToolError extends Error {}

/**
 * The saved copies of the current site, read from a captures folder (by default
 * $CARE4MIND_CAPTURES). Throws a ToolError naming the problem when the folder can't be read.
 *
 * Each page has its slug, URL, address (`path`), kind and title, and two views of its content,
 * both computed when first asked for: `outline()`, the blocks extract prints, and `text()`, all
 * of its text in one string, which verify searches.
 */
export function openCaptures(dir = process.env.CARE4MIND_CAPTURES) {
  if (!dir)
    throw new ToolError(
      'CARE4MIND_CAPTURES is not set. Point it at the folder of saved copies of the current site ' +
        '(see docs/agents/content-migration.md, "The captures").',
    )
  if (!existsSync(dir)) throw new ToolError(`CARE4MIND_CAPTURES is ${dir}, which doesn't exist.`)
  const itemsFile = join(dir, 'items.json')
  if (!existsSync(itemsFile)) throw new ToolError(`No items.json in ${dir}.`)
  const items = JSON.parse(readFileSync(itemsFile, 'utf8'))
  if (!Array.isArray(items)) throw new ToolError(`${itemsFile} doesn't hold a list of pages.`)
  const pages = items.map((item) => savedPage(item, quizFiles(dir, item.slug)))
  return {
    dir,
    pages,
    /** The page with this slug, address (`/vikshepa/`) or URL, if there is a saved copy. */
    page(ref) {
      const key = addressKey(ref)
      return pages.find((page) => page.slug === ref || addressKey(page.url) === key)
    },
  }
}

/** A page's address without its scheme, `www.`, case of host or trailing slash. */
function addressKey(ref) {
  const text = String(ref).trim()
  if (!text.includes('/')) return null
  try {
    const url = new URL(text, 'https://care4mind.org/')
    const path = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`
    return `${url.hostname.toLowerCase().replace(/^www\./, '')}${path}`
  } catch {
    return null
  }
}

/** The quiz plugin's settings and questions, saved apart, by the slug of the page they're on. */
const QUIZZES = { 'karmayoga-scale': 'karmayoga' }

function quizFiles(dir, slug) {
  const prefix = QUIZZES[slug]
  if (!prefix) return undefined
  const [questions, settings] = ['questions', 'settings'].map((part) =>
    join(dir, `${prefix}-${part}.json`),
  )
  if (!existsSync(questions) || !existsSync(settings)) return undefined
  return {
    questions: JSON.parse(readFileSync(questions, 'utf8')),
    settings: JSON.parse(readFileSync(settings, 'utf8')),
  }
}

function savedPage(item, quiz) {
  let tree
  let outline
  let text
  const parsed = () => (tree ??= parseHtml(String(item.content ?? '')))
  return {
    slug: item.slug,
    url: item.link,
    path: new URL(item.link).pathname,
    kind: item.kind,
    title: clean(decodeEntities(String(item.title ?? ''))),
    outline: () => (outline ??= outlineOf(parsed(), quiz)),
    text: () => (text ??= clean(`${decodeEntities(String(item.title ?? ''))} ${textOf(parsed())}`)),
  }
}

// ---------------------------------------------------------------------------------------------
// HTML: a small, forgiving parser for the page builder's markup. It builds a tree of
// { name, attrs, children } elements and { text } nodes, closing the elements HTML closes
// implicitly (an open <p> before a block, an open <li> before the next one, table cells).

const VOID = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

/** Elements whose content is not markup: kept as raw text and never shown. */
const RAW = new Set(['script', 'style', 'textarea', 'title', 'noscript', 'xmp'])

/** Elements whose start closes an open <p>. */
const CLOSES_P = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'details',
  'div',
  'dl',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'li',
  'main',
  'menu',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'ul',
])

const SCOPE = ['applet', 'caption', 'html', 'table', 'td', 'th', 'marquee', 'object', 'template']

/** Before an element opens: which open elements it closes, and where that search stops. */
const IMPLIED_CLOSES = {
  li: { close: ['li'], stop: ['ul', 'ol', ...SCOPE] },
  dt: { close: ['dt', 'dd'], stop: ['dl', ...SCOPE] },
  dd: { close: ['dt', 'dd'], stop: ['dl', ...SCOPE] },
  td: { close: ['td', 'th'], stop: ['tr', 'table'] },
  th: { close: ['td', 'th'], stop: ['tr', 'table'] },
  tr: { close: ['td', 'th', 'tr'], stop: ['table'] },
  thead: { close: ['td', 'th', 'tr', 'thead', 'tbody', 'tfoot'], stop: ['table'] },
  tbody: { close: ['td', 'th', 'tr', 'thead', 'tbody', 'tfoot'], stop: ['table'] },
  tfoot: { close: ['td', 'th', 'tr', 'thead', 'tbody', 'tfoot'], stop: ['table'] },
  option: { close: ['option'], stop: ['select', 'datalist'] },
}

function parseHtml(html) {
  const root = { name: '#root', attrs: {}, children: [] }
  const stack = [root]
  const lower = html.toLowerCase()
  const current = () => stack[stack.length - 1]

  /** Pops up to and including the nearest open element named in `names`, unless a stop comes first. */
  const closeOpen = (names, stops = []) => {
    for (let depth = stack.length - 1; depth > 0; depth -= 1) {
      const name = stack[depth].name
      if (names.includes(name)) {
        stack.length = depth
        return
      }
      if (stops.includes(name)) return
    }
  }

  let at = 0
  while (at < html.length) {
    const open = html.indexOf('<', at)
    if (open === -1) {
      current().children.push({ text: decodeEntities(html.slice(at)) })
      break
    }
    if (open > at) current().children.push({ text: decodeEntities(html.slice(at, open)) })
    if (html.startsWith('<!--', open)) {
      const end = html.indexOf('-->', open + 4)
      at = end === -1 ? html.length : end + 3
      continue
    }
    if (html[open + 1] === '!' || html[open + 1] === '?') {
      const end = html.indexOf('>', open)
      at = end === -1 ? html.length : end + 1
      continue
    }
    const tag = /^<(\/?)([a-zA-Z][\w:-]*)/.exec(html.slice(open, open + 80))
    if (!tag) {
      current().children.push({ text: '<' })
      at = open + 1
      continue
    }
    // The tag ends at the first '>' outside a quoted attribute value.
    let end = open + tag[0].length
    let quote = ''
    let afterEquals = false
    for (; end < html.length; end += 1) {
      const char = html[end]
      if (quote) {
        if (char === quote) quote = ''
      } else if ((char === '"' || char === "'") && afterEquals) quote = char
      else if (char === '>') break
      if (!/\s/.test(char)) afterEquals = char === '='
    }
    const name = tag[2].toLowerCase()
    const inside = html.slice(open + tag[0].length, end)
    at = end + 1
    if (tag[1]) {
      closeOpen([name])
      continue
    }
    if (CLOSES_P.has(name)) closeOpen(['p'], ['button', ...SCOPE])
    const implied = IMPLIED_CLOSES[name]
    if (implied) closeOpen(implied.close, implied.stop)
    const element = { name, attrs: parseAttributes(inside), children: [] }
    current().children.push(element)
    if (VOID.has(name) || /\/\s*$/.test(inside)) continue
    stack.push(element)
    if (RAW.has(name)) {
      const close = lower.indexOf(`</${name}`, at)
      const stop = close === -1 ? html.length : close
      element.children.push({ text: html.slice(at, stop), raw: true })
      at = stop
    }
  }
  return root
}

function parseAttributes(inside) {
  const attrs = {}
  const pattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  for (const [, name, double, single, bare] of inside.matchAll(pattern))
    attrs[name.toLowerCase()] = decodeEntities(double ?? single ?? bare ?? '')
  return attrs
}

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  sbquo: '‚',
  ldquo: '“',
  rdquo: '”',
  bdquo: '„',
  hellip: '…',
  laquo: '«',
  raquo: '»',
  lsaquo: '‹',
  rsaquo: '›',
  middot: '·',
  bull: '•',
  copy: '©',
  reg: '®',
  trade: '™',
  deg: '°',
  times: '×',
  divide: '÷',
  shy: '\u00ad',
  zwj: '\u200d',
  zwnj: '\u200c',
  ensp: '\u2002',
  emsp: '\u2003',
  thinsp: '\u2009',
  hairsp: '\u200a',
  prime: '′',
  Prime: '″',
  dagger: '†',
  Dagger: '‡',
  sect: '§',
  para: '¶',
  euro: '€',
  pound: '£',
  cent: '¢',
  yen: '¥',
  frac12: '½',
  frac14: '¼',
  frac34: '¾',
  iexcl: '¡',
  iquest: '¿',
}

function decodeEntities(text) {
  return text.replace(
    /&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z][a-zA-Z0-9]*));/g,
    (whole, decimal, hex, name) => {
      if (name) return NAMED_ENTITIES[name] ?? whole
      const point = decimal ? Number(decimal) : parseInt(hex, 16)
      const valid = point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff)
      return valid ? String.fromCodePoint(point) : '�'
    },
  )
}

/** NFC, with every run of whitespace (no-break spaces included) one space; invisible marks gone. */
function clean(text) {
  return text
    .normalize('NFC')
    .replace(/[\u200b\u00ad\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ---------------------------------------------------------------------------------------------
// The text view: every text node in reading order, with a space wherever a block or line ends.

/** Elements that are never text on the page. */
const NOT_TEXT = new Set([
  'script',
  'style',
  'svg',
  'noscript',
  'template',
  'head',
  'title',
  'iframe',
  'canvas',
  'video',
  'audio',
  'object',
  'textarea',
])

function textOf(node) {
  const parts = []
  const visit = (child) => {
    if ('text' in child) {
      if (!child.raw) parts.push(child.text)
      return
    }
    if (NOT_TEXT.has(child.name)) return
    const breaks = child.name === 'br' || !INLINE.has(child.name)
    if (breaks) parts.push(' ')
    child.children.forEach(visit)
    if (breaks) parts.push(' ')
  }
  node.children.forEach(visit)
  return parts.join('')
}

// ---------------------------------------------------------------------------------------------
// The outline view: the page as blocks.
//
//   { type: 'heading', level, text, links? }
//   { type: 'paragraph', lines, links? }          lines split where the page breaks a line
//   { type: 'list', ordered, items }               each item { lines, links? } or { blocks }
//   { type: 'table', caption?, rows }              each row { cells: [{ header, lines, links? }] }
//   { type: 'verse', label?, lines, links? }       lines { script: 'devanagari' | 'latin', text }
//   { type: 'reference', lines, links? }           a line of a reference list
//   { type: 'tab', text }                          an accordion or tab title
//   { type: 'image', alt? }  { type: 'rule' }  { type: 'shortcode', text }
//
// A link is { text, href, mark? }, where mark is '#' (a link to nowhere), 'DharmaWiki', or
// 'current site' (a link back into care4mind.org).

/** Elements that flow inside a line of text; any other element starts a new block. */
const INLINE = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'cite',
  'code',
  'data',
  'del',
  'dfn',
  'em',
  'font',
  'i',
  'ins',
  'kbd',
  'mark',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strike',
  'strong',
  'sub',
  'sup',
  'time',
  'tt',
  'u',
  'var',
])

/** Elements left out of the outline: never text, or form controls, which forms describe. */
const NOT_OUTLINED = new Set([...NOT_TEXT, 'button', 'input', 'select', 'option', 'datalist'])

function outlineOf(root, quiz) {
  if (quiz) {
    const container = findElement(root, (node) => hasClass(node, 'ays-quiz-container'))
    if (container) container.quiz = quizOf(container, quiz)
  }
  return withoutHeadingLines(markVerses(markReferences(blocksOf(root))))
}

function findElement(node, test) {
  for (const child of node.children ?? []) {
    if ('text' in child) continue
    if (test(child)) return child
    const found = findElement(child, test)
    if (found) return found
  }
  return undefined
}

/** Headings keep their lines (split where the page breaks them) only until verses are found. */
function withoutHeadingLines(blocks) {
  return blocks.map((block) => {
    if (block.type === 'heading') {
      const heading = { ...block }
      delete heading.lines
      return heading
    }
    if (block.type === 'list')
      return {
        ...block,
        items: block.items.map((item) =>
          item.blocks ? { blocks: withoutHeadingLines(item.blocks) } : item,
        ),
      }
    return block
  })
}

function linkOf(element) {
  const href = element.attrs.href.trim()
  let mark
  if (href === '' || href.startsWith('#')) mark = '#'
  else {
    try {
      const host = new URL(href, 'https://care4mind.org/').hostname.toLowerCase()
      if (host === 'dharmawiki.org' || host.endsWith('.dharmawiki.org')) mark = 'DharmaWiki'
      else if (host === 'care4mind.org' || host.endsWith('.care4mind.org')) mark = 'current site'
    } catch {
      // Not a URL: shown as it is, unmarked.
    }
  }
  return { text: clean(textOf(element)), href, ...(mark ? { mark } : {}) }
}

/** The blocks inside an element. */
function blocksOf(element) {
  const blocks = []
  let run = { lines: [''], links: [] }

  const flush = () => {
    const lines = run.lines.map(clean).filter(Boolean)
    if (lines.length > 0 || run.links.length > 0)
      blocks.push({ type: 'paragraph', lines, ...linksOf(run.links) })
    run = { lines: [''], links: [] }
  }

  const visit = (node) => {
    if ('text' in node) {
      if (!node.raw) run.lines[run.lines.length - 1] += node.text
      return
    }
    const { name } = node
    if (NOT_OUTLINED.has(name)) return
    if (name === 'br') {
      run.lines.push('')
      return
    }
    if (INLINE.has(name)) {
      if (name === 'a' && node.attrs.href !== undefined) run.links.push(linkOf(node))
      node.children.forEach(visit)
      return
    }
    flush()
    if (node.quiz) {
      blocks.push(node.quiz)
    } else if (name === 'form' && !node.wrapper) {
      blocks.push(formOf(node))
    } else if (hasClass(node, 'elementor-tab-title')) {
      const text = clean(textOf(node))
      if (text) blocks.push({ type: 'tab', text })
    } else if (/^h[1-6]$/.test(name)) {
      const inner = blocksOf(node)
      const lines = inner.flatMap(linesOfBlock).map(clean).filter(Boolean)
      if (lines.length > 0)
        blocks.push({
          type: 'heading',
          level: Number(name[1]),
          text: lines.join(' '),
          lines,
          ...linksOf(inner),
        })
    } else if (name === 'ul' || name === 'ol') {
      const items = itemsOf(node)
      if (items.length > 0) blocks.push({ type: 'list', ordered: name === 'ol', items })
    } else if (name === 'table') {
      const table = tableOf(node)
      if (table.rows.length > 0) blocks.push(table)
    } else if (name === 'img') {
      const alt = clean(node.attrs.alt ?? '')
      blocks.push({ type: 'image', ...(alt ? { alt } : {}) })
    } else if (name === 'hr') {
      blocks.push({ type: 'rule' })
    } else {
      node.children.forEach(visit)
      flush()
    }
  }

  element.children.forEach(visit)
  flush()
  return blocks
}

// A form: each fieldset of choices is a question, with its options in the page's order. Every
// other control is listed apart, with the number of questions before it, so nobody mistakes a
// stray field (such as the anti-spam field a form plugin adds) for a question.
function formOf(form) {
  const labels = new Map()
  const findLabels = (node) => {
    if ('text' in node) return
    if (node.name === 'label' && node.attrs.for) labels.set(node.attrs.for, clean(textOf(node)))
    node.children.forEach(findLabels)
  }
  findLabels(form)

  const questions = []
  const otherFields = []
  const buttons = []
  let hiddenFields = 0
  const labelOf = (control) =>
    labels.get(control.attrs.id) ?? control.attrs.placeholder ?? control.attrs.name ?? ''

  const visit = (node) => {
    if ('text' in node || NOT_TEXT.has(node.name)) return
    if (node.name === 'fieldset') {
      const legend = node.children.find((child) => child.name === 'legend')
      const options = []
      const findOptions = (child) => {
        if ('text' in child) return
        if (child.name === 'input' && ['radio', 'checkbox'].includes(child.attrs.type))
          options.push(clean(labelOf(child) || child.attrs.value || ''))
        child.children.forEach(findOptions)
      }
      findOptions(node)
      questions.push({ text: legend ? clean(textOf(legend)) : '', options })
      return
    }
    if (node.name === 'button') buttons.push(clean(textOf(node)))
    else if (node.name === 'input') {
      const type = (node.attrs.type ?? 'text').toLowerCase()
      if (type === 'hidden') hiddenFields += 1
      else if (['submit', 'button', 'reset'].includes(type)) buttons.push(node.attrs.value ?? type)
      else otherFields.push({ type, label: clean(labelOf(node)), afterQuestion: questions.length })
    } else if (node.name === 'select' || node.name === 'textarea')
      otherFields.push({
        type: node.name,
        label: clean(labelOf(node)),
        afterQuestion: questions.length,
      })
    else node.children.forEach(visit)
  }
  form.children.forEach(visit)
  return { type: 'form', questions, otherFields, hiddenFields, buttons }
}

// The quiz plugin's quiz: its parts in the order its settings' `question_ids` give (a part step,
// then that part's items), not the page markup's order, which is kept as `pageOrder`. Each
// distinct list of options is stored once, in `optionSets`. Text in the quiz that is neither a
// part nor an item (its start page, its results page) is listed in `otherText`.
function quizOf(container, { questions, settings }) {
  const steps = new Map()
  const collectSteps = (node) => {
    if ('text' in node) return
    if (node.attrs['data-question-id']) steps.set(node.attrs['data-question-id'], node)
    node.children.forEach(collectSteps)
  }
  collectSteps(container)
  const customSteps = new Map((questions.custom_steps ?? []).map((s) => [String(s.id), s]))
  const items = new Map((questions.questions ?? []).map((q) => [String(q.id), q]))

  const optionSets = []
  const parts = []
  const known = new Set()
  for (const id of String(settings.question_ids ?? '')
    .split(',')
    .map((s) => s.trim())) {
    if (customSteps.has(id)) {
      const blocks = steps.has(id) ? blocksOf(steps.get(id)) : []
      const heading = blocks.find((block) => block.type === 'heading')
      const title = heading?.text ?? ''
      const rest = blocks
        .filter((block) => block !== heading)
        .flatMap(linesOfBlock)
        .join(' ')
      const instructions = clean(rest || decodeEntities(String(customSteps.get(id).text ?? '')))
      parts.push({ step: id, title, instructions, items: [] })
      known.add(title).add(instructions)
    } else if (items.has(id)) {
      const question = items.get(id)
      const options = (question.options ?? []).map((o) => clean(decodeEntities(String(o.label))))
      let optionSet = optionSets.findIndex((set) => set.join('\n') === options.join('\n'))
      if (optionSet === -1) optionSet = optionSets.push(options) - 1
      if (parts.length === 0) parts.push({ step: null, title: '', instructions: '', items: [] })
      const text = clean(decodeEntities(String(question.text ?? '')))
      parts.at(-1).items.push({ id, text, optionSet })
      known.add(text)
      options.forEach((option) => known.add(option))
    }
  }

  // The quiz's own form is only its wrapper: outline what it holds.
  const form = findElement(container, (node) => node.name === 'form')
  if (form) form.wrapper = true
  const counter = /^\d+\s*\/\s*\d+$/
  const otherText = [...new Set(blocksOf(container).flatMap(linesOfBlock).map(clean))].filter(
    (line) => line && !known.has(line) && !counter.test(line),
  )
  return {
    type: 'quiz',
    optionSets,
    parts,
    pageOrder: (questions.order ?? []).map(String),
    otherText,
  }
}

function hasClass(element, name) {
  return (element.attrs.class ?? '').split(/\s+/).includes(name)
}

/** `{ links }` when there are any, else nothing: from links, or from the blocks holding them. */
function linksOf(source) {
  const links = source.flatMap((item) => ('href' in item ? [item] : (item.links ?? [])))
  return links.length > 0 ? { links } : {}
}

/** A block's text, line by line, whatever its type. */
function linesOfBlock(block) {
  switch (block.type) {
    case 'heading':
    case 'tab':
    case 'shortcode':
      return [block.text]
    case 'list':
      return block.items.flatMap((item) => item.lines ?? item.blocks.flatMap(linesOfBlock))
    case 'table':
      return block.rows.flatMap((row) => row.cells.flatMap((cell) => cell.lines))
    case 'verse':
      return block.lines.map((line) => line.text)
    default:
      return block.lines ?? []
  }
}

function itemsOf(list) {
  const items = []
  for (const child of list.children) {
    const blocks = blocksOf({ children: [child] })
    if (blocks.length === 0) continue
    const [only] = blocks
    if (blocks.length === 1 && only.type === 'paragraph')
      items.push({ lines: only.lines, ...linksOf(only.links ?? []) })
    else items.push({ blocks })
  }
  return items
}

function tableOf(table) {
  const rows = []
  let caption = ''
  const visitRows = (parent) => {
    for (const child of parent.children) {
      if ('text' in child) continue
      if (child.name === 'caption') caption = clean(textOf(child))
      else if (['thead', 'tbody', 'tfoot'].includes(child.name)) visitRows(child)
      else if (child.name === 'tr') rows.push({ cells: cellsOf(child) })
    }
  }
  visitRows(table)
  return {
    type: 'table',
    ...(caption ? { caption } : {}),
    rows: rows.filter((r) => r.cells.length),
  }
}

function cellsOf(row) {
  return row.children
    .filter((child) => !('text' in child))
    .map((cell) => {
      const blocks = blocksOf(cell)
      return { header: cell.name === 'th', lines: blocks.flatMap(linesOfBlock), ...linksOf(blocks) }
    })
}

// ---------------------------------------------------------------------------------------------
// Reference lists: after a heading or tab named "References" (or the like), each line is a
// reference line, until the next tab, or the next heading at the same level or above.

const REFERENCES_HEADING = /^(references?|bibliography|online resources|sources|works cited)\s*:?$/i
const SHORTCODE = /^\[[a-zA-Z_][\w-]*(\s[^\]]*)?\]$/

function markReferences(blocks) {
  const marked = []
  let level = null // the level of the heading that opened the reference list (0 for a tab)
  for (const block of blocks) {
    const text = block.type === 'paragraph' ? block.lines.join(' ') : ''
    if (block.type === 'paragraph' && SHORTCODE.test(text)) {
      marked.push({ type: 'shortcode', text })
      continue
    }
    if (
      block.type === 'tab' ||
      (block.type === 'heading' && (level === null || block.level <= level || level === 0))
    ) {
      const opens = REFERENCES_HEADING.test(block.text)
      level = opens ? (block.type === 'tab' ? 0 : block.level) : null
      marked.push(block)
      continue
    }
    if (level === null) marked.push(block)
    else if (block.type === 'paragraph')
      marked.push({ type: 'reference', lines: block.lines, ...linksOf(block.links ?? []) })
    else if (block.type === 'heading')
      marked.push({ type: 'reference', lines: block.lines, ...linksOf(block.links ?? []) })
    else if (block.type === 'list')
      for (const item of block.items)
        marked.push({
          type: 'reference',
          lines: item.lines ?? item.blocks.flatMap(linesOfBlock),
          ...linksOf(item.links ?? item.blocks ?? []),
        })
    else marked.push(block)
  }
  return marked
}

// ---------------------------------------------------------------------------------------------
// Verses: a run of Devanagari lines and the transliteration lines after them, whichever blocks
// they sit in (pages put them in headings, paragraphs and line breaks alike), labelled with the
// nearest heading or tab above. A transliteration with no Devanagari counts when it carries a
// verse mark (|, ॥ or "..") and IAST letters.

const DEVANAGARI_LETTER = /[\u0900-\u0963\u0971-\u097f]/gu
const LATIN_LETTER = /\p{Script=Latin}/gu
const IAST_MARK = /[āīūṛṝḷḹṃṁḥṅñṭḍṇśṣĀĪŪṚṜḶḸṂṀḤṄÑṬḌṆŚṢ]/u
const VERSE_MARK = /[|\u0964\u0965]|\.\.\s*\d|\d\s*\.\./u
const LABEL = /^\s*(translation|meaning|note|notes|source|commentary|explanation|interpretation)\b/i
const ENGLISH_WORDS = new Set(
  (
    'the of and is are was were to which that this these by with from for its be on an or not ' +
    'who when he she they his her their it as in into one all what how him them your you my we ' +
    'our me has have had will shall can may do does such than there been being at if'
  ).split(' '),
)

const count = (text, pattern) => (text.match(pattern) ?? []).length

function isDevanagariLine(text) {
  const devanagari = count(text, DEVANAGARI_LETTER)
  return devanagari >= 2 && devanagari >= count(text, LATIN_LETTER)
}

function isTransliterationLine(text) {
  if (count(text, DEVANAGARI_LETTER) > 0 || count(text, LATIN_LETTER) < 2) return false
  if (text.length > 200 || LABEL.test(text)) return false
  const words = text.toLowerCase().match(/\p{L}+/gu) ?? []
  return words.filter((word) => ENGLISH_WORDS.has(word)).length < 2
}

function startsTransliteratedVerse(text) {
  return isTransliterationLine(text) && IAST_MARK.test(text) && VERSE_MARK.test(text)
}

function markVerses(blocks) {
  // Every line that could join a verse, in reading order; anything else is a barrier.
  const slots = []
  blocks.forEach((block, index) => {
    if (block.type === 'heading' || block.type === 'paragraph')
      block.lines.forEach((text, line) =>
        slots.push({ index, line, text, heading: block.type === 'heading' }),
      )
    else slots.push(null)
  })

  const verseOf = new Map() // "block:line" → verse number
  let verses = 0
  for (let at = 0; at < slots.length;) {
    const slot = slots[at]
    const starts =
      slot &&
      (isDevanagariLine(slot.text) || (!slot.heading && startsTransliteratedVerse(slot.text)))
    if (!starts) {
      at += 1
      continue
    }
    verses += 1
    while (slots[at] && isDevanagariLine(slots[at].text)) {
      verseOf.set(`${slots[at].index}:${slots[at].line}`, verses)
      at += 1
    }
    while (slots[at] && !slots[at].heading && isTransliterationLine(slots[at].text)) {
      verseOf.set(`${slots[at].index}:${slots[at].line}`, verses)
      at += 1
    }
  }
  if (verses === 0) return blocks

  const marked = []
  let open = null // the verse block being filled, and its number
  const label = () => {
    for (let at = marked.length - 1; at >= 0; at -= 1)
      if (marked[at].type === 'heading' || marked[at].type === 'tab') return marked[at].text
    return undefined
  }
  const addVerseLine = (number, text) => {
    if (open?.number !== number) {
      const name = label()
      open = { number, block: { type: 'verse', ...(name ? { label: name } : {}), lines: [] } }
      marked.push(open.block)
    }
    const script = isDevanagariLine(text) ? 'devanagari' : 'latin'
    open.block.lines.push({ script, text })
  }

  blocks.forEach((block, index) => {
    const inVerse = (line) => verseOf.has(`${index}:${line}`)
    if (
      !(block.type === 'heading' || block.type === 'paragraph') ||
      !block.lines.some((_, line) => inVerse(line))
    ) {
      open = null
      marked.push(block)
      return
    }
    // Split the heading or paragraph into its verse lines and the text around them.
    const pieces = []
    let prose = null
    block.lines.forEach((text, line) => {
      const number = verseOf.get(`${index}:${line}`)
      if (number) {
        prose = null
        addVerseLine(number, text)
      } else {
        if (!prose) {
          open = null
          prose =
            block.type === 'heading'
              ? { type: 'heading', level: block.level, text: '', lines: [] }
              : { type: 'paragraph', lines: [] }
          marked.push(prose)
          pieces.push(prose)
        }
        prose.lines.push(text)
        if (prose.type === 'heading') prose.text = prose.lines.join(' ')
      }
    })
    for (const link of block.links ?? []) {
      const home =
        pieces.find((piece) => piece.lines.join(' ').includes(link.text)) ??
        pieces[0] ??
        open?.block
      if (home) (home.links ??= []).push(link)
    }
  })
  return marked
}

/**
 * Runs a tool's main function when its file is the one Node was asked to run (never on import),
 * printing a ToolError's message with exit code 2 instead of a stack trace.
 */
export async function runTool(meta, main) {
  const script = process.argv[1]
  if (!(meta.main ?? (script !== undefined && realpathSync(script) === fileURLToPath(meta.url))))
    return
  try {
    process.exitCode = (await main(process.argv.slice(2))) ?? 0
  } catch (error) {
    if (!(error instanceof ToolError)) throw error
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 2
  }
}

// ---------------------------------------------------------------------------------------------
// Printing: one block per line, its type in the first column.

const USAGE = `Usage: node scripts/content/extract.mjs <slug | address | URL> [--json]

Prints an outline of one saved page of the current site, read from $CARE4MIND_CAPTURES.
Each line starts with its block's type:
  h1–h6 heading · p paragraph · list, then its items (• or 1.) · table, then its rows: th (all
  header cells) or td, cells split by |, lines inside a cell by ⏎ · verse, under the nearest
  heading above, its lines marked devanagari or latin · ref a line of a reference list · tab an
  accordion title · image · rule · shortcode · form, with its questions and other fields ·
  quiz, with its parts in the order its settings give.
Each link follows its block: link “text” → target, marked [#], [DharmaWiki] or [current site].
--json prints the same outline as JSON.`

const COLUMN = 8
const tag = (name) => (name.length >= COLUMN ? `${name} ` : name.padEnd(COLUMN))

/** The outline of a saved page, as extract prints it. */
function formatOutline(page) {
  const out = [page.title, `${page.kind} ${page.path} · ${page.url}`, '']
  printBlocks(page.outline(), '', out)
  while (out.at(-1) === '') out.pop()
  return `${out.join('\n')}\n`
}

function printBlocks(blocks, at, out) {
  const blank = () => {
    if (out.at(-1) !== '') out.push('')
  }
  const under = `${at}${' '.repeat(COLUMN)}`
  const lines = (name, texts) =>
    texts.forEach((text, i) => out.push(`${i === 0 ? `${at}${tag(name)}` : under}${text}`))
  const links = (block) => {
    for (const link of block.links ?? [])
      out.push(`${under}link “${link.text}” → ${link.href}${link.mark ? `  [${link.mark}]` : ''}`)
  }

  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        if (at === '' && block.level <= 3) blank()
        lines(`h${block.level}`, [block.text])
        links(block)
        break
      case 'tab':
        blank()
        lines('tab', [block.text])
        break
      case 'paragraph':
        lines('p', block.lines.length > 0 ? block.lines : [''])
        links(block)
        break
      case 'reference':
        lines('ref', block.lines)
        links(block)
        break
      case 'shortcode':
        lines('shortcode', [block.text])
        break
      case 'image':
        lines('image', [block.alt ? `“${block.alt}”` : '(no alt text)'])
        break
      case 'rule':
        lines('rule', [''])
        break
      case 'verse':
        lines('verse', [block.label ? `under “${block.label}”` : '(no heading above)'])
        for (const line of block.lines)
          out.push(`${under}  ${line.script.padEnd(10)}  ${line.text}`)
        links(block)
        break
      case 'list':
        lines('list', [`${block.items.length} ${block.items.length === 1 ? 'item' : 'items'}`])
        block.items.forEach((item, i) => {
          const marker = `${at}  ${(block.ordered ? `${i + 1}.` : '•').padEnd(COLUMN - 2)}`
          if (item.lines) {
            item.lines.forEach((text, n) => out.push(`${n === 0 ? marker : under}${text}`))
            links(item)
          } else {
            out.push(marker.trimEnd())
            printBlocks(item.blocks, `${at}    `, out)
          }
        })
        break
      case 'table':
        lines('table', [
          `${block.rows.length} rows${block.caption ? `, caption “${block.caption}”` : ''}`,
        ])
        for (const row of block.rows) {
          const header = row.cells.every((cell) => cell.header)
          const cells = row.cells.map((cell) => cell.lines.join(' ⏎ ')).join(' | ')
          out.push(`${at}  ${(header ? 'th' : 'td').padEnd(COLUMN - 2)}${cells}`)
          for (const cell of row.cells) links(cell)
        }
        break
      case 'form':
        printForm(block, at, out)
        break
      case 'quiz':
        printQuiz(block, at, out)
        break
    }
  }
}

function printForm(form, at, out) {
  const under = `${at}${' '.repeat(COLUMN)}`
  out.push(`${at}${tag('form')}${form.questions.length} questions`)
  form.questions.forEach((question, i) => {
    out.push(`${at}  ${`q${i + 1}`.padEnd(COLUMN - 2)}${question.text}`)
    out.push(`${under}options  ${question.options.join(' | ')}`)
  })
  const other = form.otherFields.map(
    (field) =>
      `${field.type} field “${field.label}”, ${
        field.afterQuestion === 0
          ? 'before the first question'
          : `after question ${field.afterQuestion}`
      }`,
  )
  const chrome = [
    ...(form.hiddenFields > 0 ? [`${form.hiddenFields} hidden fields`] : []),
    ...form.buttons.map((button) => `button “${button}”`),
  ]
  if (other.length + chrome.length > 0) {
    out.push(`${under}not questions:`)
    for (const line of other) out.push(`${under}  ${line}`)
    if (chrome.length > 0) out.push(`${under}  ${chrome.join(' · ')}`)
  }
}

function printQuiz(quiz, at, out) {
  const under = `${at}${' '.repeat(COLUMN)}`
  const items = quiz.parts.reduce((sum, part) => sum + part.items.length, 0)
  out.push(
    `${at}${tag('quiz')}${quiz.parts.length} parts · ${items} items, in the order its settings' question_ids give`,
  )
  quiz.optionSets.forEach((options, i) => {
    const reverse = quiz.optionSets.findIndex(
      (other, n) => n < i && [...other].reverse().join('\n') === options.join('\n'),
    )
    const note = reverse === -1 ? '' : `  (options ${reverse + 1} reversed)`
    out.push(`${at}  ${`options ${i + 1}`.padEnd(COLUMN + 2)}${options.join(' | ')}${note}`)
  })
  quiz.parts.forEach((part, i) => {
    out.push(`${at}  part ${i + 1}  step ${part.step ?? '(none)'} · ${part.items.length} items`)
    out.push(`${under}title         ${part.title}`)
    out.push(`${under}instructions  ${part.instructions}`)
    for (const item of part.items)
      out.push(`${under}item ${item.id.padEnd(4)} [options ${item.optionSet + 1}]  ${item.text}`)
  })
  out.push(
    `${at}  page order  ${quiz.pageOrder.join(', ')}  (the order the page markup lists the items)`,
  )
  if (quiz.otherText.length > 0)
    out.push(`${at}  not items   ${quiz.otherText.map((text) => `“${text}”`).join(' · ')}`)
}

async function main(args) {
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(`${USAGE}\n`)
    return 0
  }
  const captures = openCaptures()
  const refs = args.filter((arg) => arg !== '--json')
  const slugs = captures.pages.map((page) => page.slug).join(', ')
  if (refs.length !== 1) throw new ToolError(`${USAGE}\n\nThe saved pages: ${slugs}.`)
  const page = captures.page(refs[0])
  if (!page) throw new ToolError(`No saved page “${refs[0]}”. The saved pages: ${slugs}.`)
  if (args.includes('--json')) {
    const { slug, url, path, kind, title } = page
    const outline = { slug, url, path, kind, title, blocks: page.outline() }
    process.stdout.write(`${JSON.stringify(outline, null, 2)}\n`)
  } else process.stdout.write(formatOutline(page))
  return 0
}

await runTool(import.meta, main)

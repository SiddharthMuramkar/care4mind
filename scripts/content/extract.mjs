#!/usr/bin/env node
// Prints a clean outline of one saved page of the current site: headings, paragraphs, lists,
// tables row by row, verse blocks, reference lines, and links with their targets.
//
//   node scripts/content/extract.mjs <slug | address>     the outline, as text
//   node scripts/content/extract.mjs <slug> --json        the same outline, as JSON
//
// It reads the saved copies only from $CARE4MIND_CAPTURES, never writes into the repo and never
// touches the network. The rules for using it are in docs/agents/content-migration.md.

import { openCaptures } from './captures.mjs'
import { runTool, ToolError } from './cli.mjs'

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

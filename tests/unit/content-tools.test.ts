import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import ts from 'typescript'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  CONTENT_KINDS,
  KIND_FOLDERS,
  type Block as RecordBlock,
  type ConceptRecord,
  type ContentRecord,
  type GlossaryEntryRecord,
  type PassageRecord,
  type QuestionnaireRecord,
  type ReferenceRecord,
  type TopicRecord,
} from '@/content/schema'

// The migration tools (content-v1 ticket 02): extract, verify, new and report, in
// scripts/content. They read the saved copies of the current site only from
// $CARE4MIND_CAPTURES, which CI doesn't have, so every test here builds a made-up captures
// folder and made-up records in a temporary folder. No captured text appears in this file.

const TOOLS = resolve('scripts/content')

/** Runs a tool as the command line would, with the given environment changes (undefined unsets). */
function run(tool: string, args: readonly string[], env: Record<string, string | undefined> = {}) {
  const environment = Object.fromEntries(
    Object.entries({ ...process.env, ...env }).filter(([, value]) => value !== undefined),
  ) as NodeJS.ProcessEnv
  return spawnSync(process.execPath, [join(TOOLS, `${tool}.mjs`), ...args], {
    encoding: 'utf8',
    env: environment,
  })
}

/** One block of a saved page's outline, as extract prints it with --json. */
type Block = { type: string } & Record<string, unknown>

interface SavedPage {
  slug: string
  url: string
  title: string
  outline(): Block[]
}

interface Captures {
  dir: string
  pages: SavedPage[]
  page(ref: string): SavedPage | undefined
}

const capturesModule = (await import(pathToFileURL(join(TOOLS, 'captures.mjs')).href)) as {
  openCaptures(dir: string): Captures
}

/** What verify finds for one record. */
interface Check {
  record: string
  status: 'passed' | 'failed' | 'unchecked' | 'structure'
  checked: number
  misses: { path: string; text: string; closest?: { url: string; text: string } }[]
  drafted: string[]
  notSaved: string[]
}

const verify = (await import(pathToFileURL(join(TOOLS, 'verify.mjs')).href)) as {
  checkRecord(record: ContentRecord, captures: Captures): Check
}

const report = (await import(pathToFileURL(join(TOOLS, 'report.mjs')).href)) as {
  buildReport(records: readonly ContentRecord[], captures: Captures): string
}

let scratch = ''

beforeAll(() => {
  scratch = mkdtempSync(join(tmpdir(), 'content-tools-'))
})

afterAll(() => rmSync(scratch, { recursive: true, force: true }))

describe('the captures rule', { timeout: 30_000 }, () => {
  const CAPTURE_READERS = ['extract', 'verify', 'report']

  it.each(CAPTURE_READERS)('%s refuses to run without CARE4MIND_CAPTURES', (tool) => {
    const result = run(tool, ['example'], { CARE4MIND_CAPTURES: undefined })
    expect(result.status).toBe(2)
    expect(result.stderr).toContain('CARE4MIND_CAPTURES is not set')
  })

  it.each(CAPTURE_READERS)('%s refuses a captures folder that is missing', (tool) => {
    const missing = join(scratch, 'no-such-folder')
    const result = run(tool, ['example'], { CARE4MIND_CAPTURES: missing })
    expect(result.status).toBe(2)
    expect(result.stderr).toContain(`CARE4MIND_CAPTURES is ${missing}, which doesn't exist`)
  })

  it.each(CAPTURE_READERS)('%s refuses a captures folder without items.json', (tool) => {
    const empty = join(scratch, 'empty-captures')
    mkdirSync(empty, { recursive: true })
    const result = run(tool, ['example'], { CARE4MIND_CAPTURES: empty })
    expect(result.status).toBe(2)
    expect(result.stderr).toContain(`No items.json in ${empty}`)
  })
})

/** A made-up captures folder holding the given items, as items.json holds the current site's. */
function captures(name: string, items: readonly object[], files: Record<string, unknown> = {}) {
  const dir = join(scratch, name)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'items.json'), JSON.stringify(items))
  for (const [file, content] of Object.entries(files))
    writeFileSync(join(dir, file), JSON.stringify(content))
  return dir
}

// A made-up page in the page builder's markup: wrappers, an accordion, entities, a verse, links,
// a list, a table, an image, a script, a comment and a leftover shortcode. Its "udāharaṇa" is
// typed decomposed (a + U+0304, n + U+0323), as some pages store their IAST.
const EXAMPLE_PAGE = {
  kind: 'page',
  slug: 'udaharana',
  link: 'https://care4mind.org/udaharana/',
  title: 'Udaharana &#8211; Example',
  content: `
<div data-elementor-type="wp-page" class="elementor elementor-7"><section class="elementor-section elementor-top-section">
<div class="elementor-container"><div class="elementor-widget-wrap">
<div class="elementor-widget-container"><h2 class="elementor-heading-title">Udaharana (Example)</h2></div>
<div class="elementor-widget-container">
<h3> </h3><h3><b>Shloka from the Example Sutra </b><b>(Chapter 1, Sutra 1)</b></h3>
<h4><span style="font-weight: 400;">उदाहरणम् इदम् ।</span></h4>
<h4><span style="font-weight: 400;">सर्वम् उदाहरणम् ॥ १.१॥</span></h4>
<p><b> </b><span style="font-weight: 400;">udāharaṇam idam |</span></p>
<p><span style="font-weight: 400;">sarvam udāharaṇaṁ || 1.1 ||</span></p>
<p><b><i>Translation: </i></b><span>This is an example; all is an example.</span></p>
<p><b>Meaning:</b> <span>Every rule needs an example.</span></p>
<h4><span>एकम् उदाहरणम् ।</span><br><span>द्वितीयम् उदाहरणम् ॥ १.२॥</span></h4>
<p><span>ekam udāharaṇam |</span><br><span>dvitīyam udāharaṇam || 1.2 ||</span></p>
<p>Two examples, one after the other.</p>
</div>
<div class="elementor-accordion"><div class="elementor-accordion-item">
<div class="elementor-tab-title" data-tab="1"><span class="elementor-accordion-icon"><svg viewBox="0 0 1 1"><path d="M0 0"></path></svg></span>
<a class="elementor-accordion-title" tabindex="0">Introduction</a></div>
<div class="elementor-tab-content elementor-clearfix" data-tab="1"><section class="karma-karta-section">
<h2><b>What is an example&nbsp;?</b></h2>
<p><span>An <a href="https://dharmawiki.org/index.php/Udaharana_(%E0%A4%89)">uda\u0304haran\u0323a</a> shows a rule &amp; its use (Author, 2020).</span><br>
It is “made up” &#8211; on purpose.</p>
<p>See <a href="#">the other page</a> or <a href="https://care4mind.org/concepts/">the concepts</a>.</p>
<ul><li>First point</li><li>Second <i>point</i></li></ul>
<h6>A comparison of examples (Author, 2020).</h6>
<table><tbody><tr><th>Term</th><th>Use</th></tr>
<tr><td><p>Udaharana</p><p>(Example)</p></td><td>Shows a rule</td></tr></tbody></table>
<img src="https://example.org/uploads/example.png" alt="A drawing of an example">
<!-- an editor's comment -->
<script>window.example = 'never shown'</script><style>.example { color: red }</style>
</section></div></div>
<div class="elementor-accordion-item"><div class="elementor-tab-title" data-tab="2">
<a class="elementor-accordion-title" tabindex="0">References</a></div>
<div class="elementor-tab-content" data-tab="2"><ul>
<li>Author, A. (2020). <i>A made-up book</i>. Example Press. <a href="https://example.org/book">See the book.</a></li>
</ul></div></div></div>
<div class="elementor-widget-container">[example_code name="Test"]</div>
</div></div></section></div>`,
}

// A made-up survey in the form plugin's markup: two questions, a text field between them (the
// kind of hidden anti-spam field the plugin adds), hidden inputs and a submit button.
const EXAMPLE_SURVEY = {
  kind: 'page',
  slug: 'example-survey',
  link: 'https://care4mind.org/example-survey/',
  title: 'Example Survey',
  content: `
<div class="elementor-widget-container"><h2 class="elementor-heading-title">Example Survey</h2></div>
<div class="wpforms-container"><form id="wpforms-form-9" class="wpforms-form" method="post" action="/x/">
<noscript class="wpforms-error-noscript">Please enable JavaScript to fill in this form.</noscript>
<div class="wpforms-field-container">
<div class="wpforms-field wpforms-field-radio" data-field-id="1"><fieldset>
<legend class="wpforms-field-label">Question 1: (Colour) Which colour do you like? <span class="wpforms-required-label">*</span></legend>
<ul><li><input type="radio" id="f1_1" name="wpforms[fields][1]" value="Red"><label for="f1_1">Red</label></li>
<li><input type="radio" id="f1_2" name="wpforms[fields][1]" value="Blue &amp; green"><label for="f1_2">Blue &amp; green</label></li></ul>
</fieldset></div>
<div class="wpforms-field wpforms-field-text" data-field-id="5">
<label class="wpforms-field-label" for="f5">leave this empty</label><input type="text" id="f5" name="wpforms[fields][5]">
</div>
<div class="wpforms-field wpforms-field-radio" data-field-id="2"><fieldset>
<legend>Question 2:(Shape) Which shape? *</legend>
<ul><li><input type="radio" id="f2_1" name="wpforms[fields][2]" value="Round"><label for="f2_1">Round</label></li>
<li><input type="radio" id="f2_2" name="wpforms[fields][2]" value="Square"><label for="f2_2">Square</label></li></ul>
</fieldset></div>
</div>
<input type="hidden" name="wpforms[id]" value="9"><input type="hidden" name="page_url" value="https://example.org/">
<button type="submit" name="wpforms[submit]">Submit</button>
</form></div>`,
}

// A made-up quiz in the quiz plugin's markup, saved where the KarmaYoga Scale's is: the page
// lists the part steps first and the items after them, in an order of its own; the parsed
// questions and settings beside items.json give each part's items.
const step = (id: number, heading: string, text: string) =>
  `<div class="step ays-custom-step" data-question-id="${id}" data-type="custom">` +
  `<div class="ays_quiz_question"><h1><strong>${heading}</strong></h1><p>${text}</p></div>` +
  `<input type="button" class="ays_next action-button" value="Next"></div>`
const item = (id: number, counter: string, text: string, options: readonly string[]) =>
  `<div class="step" data-question-id="${id}" data-type="radio"><p class="ays-question-counter">${counter}</p>` +
  `<div class="ays_quiz_question"><p>${text}</p></div><div class="ays-quiz-answers">` +
  options
    .map(
      (option, i) =>
        `<input type="radio" id="a${id}-${i}" value="${i}"><label for="a${id}-${i}">${option}</label>`,
    )
    .join('') +
  `</div></div>`
const YES_NO = ['Yes', 'No']
const TRUE_FALSE = ['False', 'True']
const EXAMPLE_QUIZ_PAGE = {
  kind: 'post',
  slug: 'karmayoga-scale',
  link: 'https://care4mind.org/karmayoga-scale/',
  title: 'Example Scale',
  content:
    `<div class="ays-quiz-container" id="ays-quiz-container-3"><form class="ays-quiz-form" id="ays_finish_quiz_3">` +
    `<div class="step"><div class="ays-start-page"><p class="ays-fs-title">Example Scale</p>` +
    `<div class="ays-fs-subtitle"><p>Answer from your own experience</p></div>` +
    `<input type="button" class="start_button" value="Start"></div></div>` +
    step(30, 'Part A - 1', 'Say how often each happens.') +
    step(31, 'Part B - 2', 'Say how far you agree.') +
    item(11, '1 / 4', 'I notice examples.', YES_NO) +
    item(12, '2 / 4', 'I write examples.', YES_NO) +
    item(21, '3 / 4', 'Examples help me.', TRUE_FALSE) +
    item(22, '4 / 4', 'Examples bore me.', [...TRUE_FALSE].reverse()) +
    `<div class="step ays_thank_you_fs"><div class="ays_quiz_results_page">` +
    `<p class="ays_average">Thank you for taking part.</p><button type="button"><span>Start again</span></button>` +
    `</div></div></form></div>`,
}
const QUIZ_FILES = {
  'karmayoga-questions.json': {
    order: ['11', '12', '21', '22'],
    custom_steps: [
      { id: '30', text: 'Part A - 1 Say how often each happens.' },
      { id: '31', text: 'Part B - 2 Say how far you agree.' },
    ],
    questions: [
      { id: '11', text: 'I notice examples.', options: YES_NO },
      { id: '12', text: 'I write examples.', options: YES_NO },
      { id: '21', text: 'Examples help me.', options: TRUE_FALSE },
      { id: '22', text: 'Examples bore me.', options: [...TRUE_FALSE].reverse() },
    ].map((q, i) => ({
      ...q,
      type: 'radio',
      required: 'false',
      counter: `${i + 1} / 4`,
      options: q.options.map((label, n) => ({ answer_id: `${i}${n}`, label })),
    })),
  },
  'karmayoga-settings.json': {
    title: 'Example Scale',
    description: 'Answer from your own experience',
    question_ids: '30,12,11,31,21,22',
  },
}

describe('extract', () => {
  let site: Captures

  beforeAll(() => {
    site = capturesModule.openCaptures(
      captures('site', [EXAMPLE_PAGE, EXAMPLE_SURVEY, EXAMPLE_QUIZ_PAGE], QUIZ_FILES),
    )
  })

  it('outlines a saved page without its markup, entities decoded and text NFC', () => {
    expect(site.page('udaharana')?.outline()).toEqual([
      { type: 'heading', level: 2, text: 'Udaharana (Example)' },
      { type: 'heading', level: 3, text: 'Shloka from the Example Sutra (Chapter 1, Sutra 1)' },
      {
        type: 'verse',
        label: 'Shloka from the Example Sutra (Chapter 1, Sutra 1)',
        lines: [
          { script: 'devanagari', text: 'उदाहरणम् इदम् ।' },
          { script: 'devanagari', text: 'सर्वम् उदाहरणम् ॥ १.१॥' },
          { script: 'latin', text: 'udāharaṇam idam |' },
          { script: 'latin', text: 'sarvam udāharaṇaṁ || 1.1 ||' },
        ],
      },
      { type: 'paragraph', lines: ['Translation: This is an example; all is an example.'] },
      { type: 'paragraph', lines: ['Meaning: Every rule needs an example.'] },
      {
        type: 'verse',
        label: 'Shloka from the Example Sutra (Chapter 1, Sutra 1)',
        lines: [
          { script: 'devanagari', text: 'एकम् उदाहरणम् ।' },
          { script: 'devanagari', text: 'द्वितीयम् उदाहरणम् ॥ १.२॥' },
          { script: 'latin', text: 'ekam udāharaṇam |' },
          { script: 'latin', text: 'dvitīyam udāharaṇam || 1.2 ||' },
        ],
      },
      { type: 'paragraph', lines: ['Two examples, one after the other.'] },
      { type: 'tab', text: 'Introduction' },
      { type: 'heading', level: 2, text: 'What is an example ?' },
      {
        type: 'paragraph',
        lines: [
          'An udāharaṇa shows a rule & its use (Author, 2020).',
          'It is “made up” – on purpose.',
        ],
        links: [
          {
            text: 'udāharaṇa',
            href: 'https://dharmawiki.org/index.php/Udaharana_(%E0%A4%89)',
            mark: 'DharmaWiki',
          },
        ],
      },
      {
        type: 'paragraph',
        lines: ['See the other page or the concepts.'],
        links: [
          { text: 'the other page', href: '#', mark: '#' },
          { text: 'the concepts', href: 'https://care4mind.org/concepts/', mark: 'current site' },
        ],
      },
      {
        type: 'list',
        ordered: false,
        items: [{ lines: ['First point'] }, { lines: ['Second point'] }],
      },
      { type: 'heading', level: 6, text: 'A comparison of examples (Author, 2020).' },
      {
        type: 'table',
        rows: [
          {
            cells: [
              { header: true, lines: ['Term'] },
              { header: true, lines: ['Use'] },
            ],
          },
          {
            cells: [
              { header: false, lines: ['Udaharana', '(Example)'] },
              { header: false, lines: ['Shows a rule'] },
            ],
          },
        ],
      },
      { type: 'image', alt: 'A drawing of an example' },
      { type: 'tab', text: 'References' },
      {
        type: 'reference',
        lines: ['Author, A. (2020). A made-up book. Example Press. See the book.'],
        links: [{ text: 'See the book.', href: 'https://example.org/book' }],
      },
      { type: 'shortcode', text: '[example_code name="Test"]' },
    ])
  })

  it('outlines a form as its questions and options, with every other field apart', () => {
    expect(site.page('example-survey')?.outline()).toEqual([
      { type: 'heading', level: 2, text: 'Example Survey' },
      {
        type: 'form',
        questions: [
          {
            text: 'Question 1: (Colour) Which colour do you like? *',
            options: ['Red', 'Blue & green'],
          },
          { text: 'Question 2:(Shape) Which shape? *', options: ['Round', 'Square'] },
        ],
        otherFields: [{ type: 'text', label: 'leave this empty', afterQuestion: 1 }],
        hiddenFields: 2,
        buttons: ['Submit'],
      },
    ])
  })

  it('outlines the KarmaYoga quiz as its parts, in the order its settings give', () => {
    expect(site.page('karmayoga-scale')?.outline()).toEqual([
      {
        type: 'quiz',
        optionSets: [YES_NO, TRUE_FALSE, [...TRUE_FALSE].reverse()],
        parts: [
          {
            step: '30',
            title: 'Part A - 1',
            instructions: 'Say how often each happens.',
            items: [
              { id: '12', text: 'I write examples.', optionSet: 0 },
              { id: '11', text: 'I notice examples.', optionSet: 0 },
            ],
          },
          {
            step: '31',
            title: 'Part B - 2',
            instructions: 'Say how far you agree.',
            items: [
              { id: '21', text: 'Examples help me.', optionSet: 1 },
              { id: '22', text: 'Examples bore me.', optionSet: 2 },
            ],
          },
        ],
        pageOrder: ['11', '12', '21', '22'],
        otherText: [
          'Example Scale',
          'Answer from your own experience',
          'Thank you for taking part.',
        ],
      },
    ])
  })

  it('prints the outline, marking # links and DharmaWiki links', () => {
    const result = run('extract', ['udaharana'], { CARE4MIND_CAPTURES: site.dir })
    expect(result.status).toBe(0)
    const lines = result.stdout.split('\n').map((line) => line.trimEnd())
    expect(lines.slice(0, 2)).toEqual([
      'Udaharana – Example',
      'page /udaharana/ · https://care4mind.org/udaharana/',
    ])
    expect(lines).toContain('h3      Shloka from the Example Sutra (Chapter 1, Sutra 1)')
    expect(lines).toContain('verse   under “Shloka from the Example Sutra (Chapter 1, Sutra 1)”')
    expect(lines).toContain('          devanagari  सर्वम् उदाहरणम् ॥ १.१॥')
    expect(lines).toContain('          latin       sarvam udāharaṇaṁ || 1.1 ||')
    expect(lines).toContain(
      '        link “udāharaṇa” → https://dharmawiki.org/index.php/Udaharana_(%E0%A4%89)  [DharmaWiki]',
    )
    expect(lines).toContain('        link “the other page” → #  [#]')
    expect(lines).toContain('  td    Udaharana ⏎ (Example) | Shows a rule')
    expect(lines).toContain(
      'ref     Author, A. (2020). A made-up book. Example Press. See the book.',
    )
    expect(result.stdout).not.toContain('never shown')
  })

  it('prints the same outline as JSON', () => {
    const result = run('extract', ['/example-survey/', '--json'], { CARE4MIND_CAPTURES: site.dir })
    expect(result.status).toBe(0)
    expect(JSON.parse(result.stdout)).toEqual({
      slug: 'example-survey',
      url: 'https://care4mind.org/example-survey/',
      path: '/example-survey/',
      kind: 'page',
      title: 'Example Survey',
      blocks: site.page('example-survey')?.outline(),
    })
  })

  it('names the saved pages when asked for one it doesn’t have', () => {
    const result = run('extract', ['no-such-page'], { CARE4MIND_CAPTURES: site.dir })
    expect(result.status).toBe(2)
    expect(result.stderr).toContain('No saved page “no-such-page”')
    expect(result.stderr).toContain('example-survey')
  })

  it('finds a saved page by its slug, its address or its URL', () => {
    expect(site.page('/udaharana/')?.slug).toBe('udaharana')
    expect(site.page('https://care4mind.org/udaharana/')?.slug).toBe('udaharana')
    expect(site.page('http://care4mind.org/udaharana')?.title).toBe('Udaharana – Example')
    expect(site.page('no-such-page')).toBeUndefined()
  })
})

const PAGE = 'https://care4mind.org/udaharana/'

/** A made-up Concept from the made-up page, with the given blocks in its one section. */
function concept(
  blocks: readonly RecordBlock[],
  changes: Partial<ConceptRecord> = {},
): ConceptRecord {
  return {
    kind: 'concept',
    slug: 'udaharana',
    name: { english: 'Example' },
    summary: 'Every rule needs an example.',
    topics: { primary: 'mind' },
    verses: [],
    sections: [{ id: 'what-is-an-example', heading: 'What is an example?', blocks }],
    references: [],
    reviewStatus: 'carried-over-not-reviewed',
    provenance: { sources: [{ url: PAGE, retrieved: '2026-10-27' }], edits: [], flags: [] },
    ...changes,
  }
}

const paragraphs = (...texts: string[]): RecordBlock[] =>
  texts.map((text) => ({ kind: 'paragraph', text }))

/** The made-up page as a record's only source, with these edits listed. */
const editedBy = (...edits: string[]) => ({
  provenance: { sources: [{ url: PAGE, retrieved: '2026-10-27' }], edits, flags: [] },
})

describe('verify', () => {
  let site: Captures

  beforeAll(() => {
    site = capturesModule.openCaptures(captures('verify-site', [EXAMPLE_PAGE]))
  })

  it('finds each string on its page after normalising both sides', () => {
    const record = concept(
      paragraphs(
        'AN UDĀHARAṆA shows a rule &  its use (Author, 2020).', // letter case, whitespace
        'uda\u0304haran\u0323a', // decomposed: NFC
        'It is "made up" - on purpose.', // straight quotes, a hyphen for the dash
        'sarvam udāharaṇaṃ', // ṃ for the page's ṁ
      ),
    )
    // The heading, “What is an example?”, is “What is an example ?” on the page.
    expect(verify.checkRecord(record, site)).toMatchObject({
      record: 'concept/udaharana',
      status: 'passed',
      checked: 7,
      misses: [],
    })
  })

  it('applies each “old” → “new” replacement an edit lists before searching the page', () => {
    const record = concept(
      paragraphs(
        'It is “made up” – on porpoise.',
        'An udāharaṇa shows a law & its use.',
        'It is “invented” – on purpose.',
      ),
      editedBy(
        'Kept as the record has it: “purpose” → “porpoise”.',
        'Two changes in one edit: “rule” → “law”, and “ (Author, 2020)” → “” deleted.',
        'Quotes inside a quote: “It is “made up”” → “It is “invented””.',
      ),
    )
    expect(verify.checkRecord(record, site)).toMatchObject({ status: 'passed', misses: [] })
  })

  it('accepts text quoted in full in an edit, and the page’s own text before its edits', () => {
    const record = concept(
      paragraphs('A sentence no page has.', 'shows a rule & its use'),
      editedBy('Added for the example: “A sentence no page has.”', '“rule” → “law”'),
    )
    expect(verify.checkRecord(record, site)).toMatchObject({ status: 'passed', misses: [] })
  })

  it('reports each miss with its field path, the string and the closest text on the page', () => {
    const record = concept(paragraphs('Every rule needs an exemplar.', 'उदाहरणम् अन्यत्'))
    const check = verify.checkRecord(record, site)
    expect(check.status).toBe('failed')
    expect(check.misses).toEqual([
      {
        path: 'sections[0].blocks[0].text',
        text: 'Every rule needs an exemplar.',
        closest: { url: PAGE, text: expect.stringContaining('Every rule needs an example.') },
      },
      {
        path: 'sections[0].blocks[1].text',
        text: 'उदाहरणम् अन्यत्',
        closest: { url: PAGE, text: expect.stringContaining('उदाहरणम्') },
      },
    ])
  })

  it('passes an ASCII spelling equal to its term’s IAST without diacritics, case, spaces or hyphens', () => {
    const term = { iast: 'udāharaṇam', ascii: ['UDAHARANAM', 'Uda-haranam', 'Udaharnam'] }
    const record = concept([{ kind: 'term', id: 'udaharanam', term, blocks: [] }])
    expect(verify.checkRecord(record, site).misses.map((miss) => miss.text)).toEqual(['Udaharnam'])
  })

  it('skips ids, links between records, URLs and meta fields, and lists drafted fields', () => {
    const record = concept(
      [{ kind: 'verse', quote: { passage: 'nowhere/1.1', translation: 'x' } }],
      {
        slug: 'not-on-the-page',
        summary: 'Written for the new site.',
        topics: { primary: 'nowhere', also: ['elsewhere'] },
        references: ['nobody-2020'],
        questionnaire: 'nothing',
        external: [{ label: 'Example', url: 'https://example.org/not-on-the-page' }],
        reviewStatus: 'drafted-not-reviewed',
        provenance: {
          sources: [{ url: PAGE, retrieved: '2026-10-27' }],
          edits: [],
          flags: [{ for: 'research-editor', note: 'A note no page has.' }],
          drafted: ['summary'],
        },
      },
    )
    expect(verify.checkRecord(record, site)).toMatchObject({
      status: 'passed',
      checked: 3,
      misses: [],
      drafted: ['summary'],
    })
  })

  it('reads a Questionnaire’s source as a link, and a translation’s source as text', () => {
    const questionnaire: QuestionnaireRecord = {
      kind: 'questionnaire',
      slug: 'udaharana',
      title: 'Udaharana (Example)',
      sourceTitle: 'Udaharana – Example',
      status: 'coming-later',
      concepts: ['udaharana'],
      source: 'nobody-2020',
      candidateSource: 'nobody-2021',
      scoring: { status: 'pending', reason: 'No documented rules yet.' },
      heldBack: [{ what: 'Three bands of results', where: 'Under the last heading' }],
      reviewStatus: 'carried-over-not-reviewed',
      ...editedBy(),
    }
    const passage: PassageRecord = {
      kind: 'passage',
      id: 'example-sutra/1.1',
      work: 'example-sutra',
      locator: '1.1',
      order: [1, 1],
      devanagari: ['उदाहरणम् इदम् ।'],
      transliteration: { lines: ['udāharaṇam idam |'], scheme: 'iast' },
      translations: [
        {
          id: 'udaharana',
          text: 'This is an example; all is an example.',
          source: 'A translator no page names',
        },
      ],
      ...editedBy(),
    }
    expect(verify.checkRecord(questionnaire, site)).toMatchObject({ status: 'passed', checked: 2 })
    expect(verify.checkRecord(passage, site).misses.map((miss) => miss.path)).toEqual([
      'translations[0].source',
    ])
  })

  it('lists a record with no saved source as unchecked, never as passed', () => {
    const reference: ReferenceRecord = {
      kind: 'reference',
      id: 'author-2020',
      type: 'book',
      authors: 'Author, A.',
      year: '2020',
      title: 'A made-up book',
      asCited: ['Author, A. (2020). A made-up book.'],
      provenance: {
        sources: [{ url: 'https://doi.org/10.0000/example', retrieved: '2026-10-26' }],
        edits: [],
        flags: [],
      },
    }
    expect(verify.checkRecord(reference, site)).toMatchObject({
      record: 'reference/author-2020',
      status: 'unchecked',
      checked: 0,
      notSaved: ['https://doi.org/10.0000/example'],
    })
  })

  it('fails a record citing a page of the current site that has no saved copy', () => {
    const missing = 'https://care4mind.org/not-saved/'
    const record = concept(paragraphs('Every rule needs an example.'), {
      provenance: {
        sources: [
          { url: PAGE, retrieved: '2026-10-27' },
          { url: missing, retrieved: '2026-10-27' },
        ],
        edits: [],
        flags: [],
      },
    })
    expect(verify.checkRecord(record, site)).toMatchObject({
      status: 'failed',
      notSaved: [missing],
    })
  })

  it('checks a topic’s introduction against its own sources, and nothing else in a topic', () => {
    const plain: TopicRecord = {
      kind: 'topic',
      slug: 'mind',
      name: { english: 'A name from the design notes' },
      order: 1,
    }
    const introduced: TopicRecord = {
      ...plain,
      slug: 'values',
      intro: {
        sections: [
          {
            id: 'what',
            heading: 'What is an example?',
            blocks: paragraphs('Every rule needs a law.'),
          },
        ],
        references: ['author-2020'],
        ...editedBy('“an example” → “a law”'),
      },
    }
    expect(verify.checkRecord(plain, site)).toMatchObject({
      record: 'topic/mind',
      status: 'structure',
      checked: 0,
    })
    expect(verify.checkRecord(introduced, site)).toMatchObject({ status: 'passed', checked: 2 })
  })

  it('applies no edit written another way', () => {
    const record = concept(paragraphs('shows a law & its use'), editedBy('"rule" -> "law"'))
    expect(verify.checkRecord(record, site).misses.map((miss) => miss.text)).toEqual([
      'shows a law & its use',
    ])
  })
})

/** A made-up repo root holding record files, with its registry written by the registry script. */
function repo(name: string, files: Record<string, string>) {
  const root = join(scratch, name)
  for (const [path, source] of Object.entries(files)) {
    const file = join(root, 'src/content/data', path)
    mkdirSync(join(file, '..'), { recursive: true })
    writeFileSync(file, source)
  }
  expect(run('registry', ['--root', root]).status).toBe(0)
  return root
}

/** A record file, written as TypeScript (a typed constant) to show verify reads TypeScript. */
const recordFile = (record: object) =>
  `const record: { kind: string } = ${JSON.stringify(record, null, 2)}\nexport default record\n`

describe('the verify command', { timeout: 30_000 }, () => {
  let site = ''
  let root = ''

  beforeAll(() => {
    site = captures('verify-command-site', [EXAMPLE_PAGE])
    root = repo('verify-command-repo', {
      'concepts/udaharana.ts': recordFile(
        concept(paragraphs('Every rule needs an example.'), {
          summary: 'Written for the new site.',
          reviewStatus: 'drafted-not-reviewed',
          provenance: { ...editedBy().provenance, drafted: ['summary'] },
        }),
      ),
      'concepts/broken.ts': recordFile(
        concept(paragraphs('Every rule needs an exemplar.'), { slug: 'broken' }),
      ),
      'references/author-2020.ts': recordFile({
        kind: 'reference',
        id: 'author-2020',
        type: 'book',
        title: 'A made-up book',
        asCited: [],
        provenance: {
          sources: [{ url: 'https://doi.org/10.0000/example', retrieved: '2026-10-26' }],
          edits: [],
          flags: [],
        },
      }),
      'topics/mind.ts': recordFile({
        kind: 'topic',
        slug: 'mind',
        name: { english: 'Mind' },
        order: 1,
      }),
    })
  })

  const verifyIn = (...args: string[]) =>
    run('verify', ['--root', root, ...args], { CARE4MIND_CAPTURES: site })

  it('passes the records it is given, listing drafted fields, and exits 0', () => {
    const result = verifyIn('concept/udaharana', 'topic', 'reference')
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('concept/udaharana')
    expect(result.stdout).toMatch(/drafted\s+concept\/udaharana: summary/)
    expect(result.stdout).toMatch(
      /unchecked\s+reference\/author-2020: no saved copy of https:\/\/doi\.org\/10\.0000\/example/,
    )
    expect(result.stdout).toContain(
      'verify: 3 records · 1 passed · 1 unchecked · 1 structure only · 0 failed',
    )
  })

  it('prints each miss and exits 1', () => {
    const result = verifyIn()
    expect(result.status).toBe(1)
    expect(result.stdout).toMatch(/FAILED\s+concept\/broken: 1 of 4 strings not found/)
    expect(result.stdout).toContain('sections[0].blocks[0].text')
    expect(result.stdout).toContain('Every rule needs an exemplar.')
    expect(result.stdout).toContain('Every rule needs an example.')
    expect(result.stdout).toContain(
      'verify: 4 records · 1 passed · 1 unchecked · 1 structure only · 1 failed',
    )
  })

  it('refuses a kind or an id it has no record for', () => {
    expect(verifyIn('concept/nothing').stderr).toContain('No record concept/nothing.')
    expect(verifyIn('glossary').stderr).toContain('No glossary records.')
    expect(verifyIn('colour').stderr).toContain('“colour” is not a kind of record')
    expect(verifyIn('concept/nothing').status).toBe(2)
  })

  it('refuses a registry that is out of date, naming the command that writes it', () => {
    const stale = repo('stale-repo', { 'topics/mind.ts': recordFile({ kind: 'topic' }) })
    writeFileSync(join(stale, 'src/content/data/topics/self.ts'), recordFile({ kind: 'topic' }))
    const result = run('verify', ['--root', stale], { CARE4MIND_CAPTURES: site })
    expect(result.status).toBe(2)
    expect(result.stderr).toContain('node scripts/content/registry.mjs')
  })
})

describe('report', () => {
  let site: Captures
  const OLD_PAGE = { ...EXAMPLE_SURVEY, slug: 'old-page', link: 'https://care4mind.org/old-page/' }
  const sources = [{ url: PAGE, retrieved: '2026-10-27' }]
  const shared = 'Its description may be adapted from DharmaWiki.'
  const entry = (slug: string): GlossaryEntryRecord => ({
    kind: 'glossary',
    slug,
    name: { ascii: slug },
    provenance: { sources, edits: [], flags: [{ for: 'project-owner', note: shared, ticket: 13 }] },
  })
  const records: ContentRecord[] = [
    entry('two'),
    {
      kind: 'questionnaire',
      slug: 'udaharana',
      title: 'Udaharana Profile',
      sourceTitle: 'Udaharana – Example',
      status: 'coming-later',
      concepts: ['udaharana'],
      scoring: { status: 'pending', reason: 'No documented rules yet.' },
      heldBack: [
        { what: 'Three result bands with their messages', where: 'Under the last heading' },
      ],
      reviewStatus: 'carried-over-not-reviewed',
      provenance: { sources, edits: [], flags: [{ for: 'psychology-expert', note: 'Note B.' }] },
    },
    concept(paragraphs('Every rule needs an example.'), {
      reviewStatus: 'drafted-not-reviewed',
      provenance: {
        sources,
        edits: [],
        flags: [
          { for: 'research-editor', note: 'Note A.', ticket: 17 },
          { for: 'project-owner', note: shared },
        ],
        drafted: ['summary'],
      },
    }),
    entry('one'),
    {
      kind: 'topic',
      slug: 'values',
      name: { english: 'Values' },
      order: 4,
      intro: {
        sections: [],
        references: [],
        provenance: { sources, edits: [], flags: [{ for: 'research-editor', note: 'Note C.' }] },
      },
    },
  ]

  beforeAll(() => {
    site = capturesModule.openCaptures(captures('report-site', [EXAMPLE_PAGE, OLD_PAGE]))
  })

  it('groups every flag by role, collapsing identical notes into one line with a count', () => {
    const lines = report.buildReport(records, site).split('\n')
    const section = (heading: string) => {
      const start = lines.indexOf(heading)
      const end = lines.findIndex((line, i) => i > start && line.startsWith('## '))
      return lines.slice(start + 1, end === -1 ? undefined : end).filter(Boolean)
    }
    expect(section('## Research editor: 2 flags')).toEqual([
      '- Note A. — concept/udaharana (ticket 17)',
      '- Note C. — topic/values',
    ])
    expect(section('## Psychology expert: 1 flag')).toEqual(['- Note B. — questionnaire/udaharana'])
    expect(section('## Project owner: 3 flags')).toEqual([
      `- ${shared} — 3 records: concept/udaharana, glossary/one, glossary/two (ticket 13)`,
    ])
  })

  it('lists the drafted fields, each Questionnaire’s held-back items and a map of the saved pages', () => {
    const text = report.buildReport(records, site)
    expect(text).toContain('## Drafted fields\n\n- concept/udaharana: summary\n')
    expect(text).toContain(
      '### questionnaire/udaharana\n\n- Three result bands with their messages — Under the last heading\n',
    )
    expect(text).toContain(
      '| `/udaharana/` | Udaharana – Example | concept/udaharana, topic/values, questionnaire/udaharana, glossary/one, glossary/two |',
    )
    expect(text).toContain('| `/old-page/` | Example Survey | dropped |')
  })
})

/** Every file under a folder, with its contents. */
function snapshot(dir: string): Record<string, string> {
  return Object.fromEntries(
    readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => join(entry.parentPath, entry.name))
      .map((file) => [file, readFileSync(file, 'utf8')]),
  )
}

describe('the tools write nothing', { timeout: 30_000 }, () => {
  it('but the flags pack, when report is asked to --write it', () => {
    const site = captures('writes-site', [EXAMPLE_PAGE])
    const root = repo('writes-repo', {
      'concepts/udaharana.ts': recordFile(concept(paragraphs('Every rule needs an example.'))),
    })
    const before = { repo: snapshot(root), captures: snapshot(site) }
    const env = { CARE4MIND_CAPTURES: site }
    expect(run('extract', ['udaharana'], env).status).toBe(0)
    expect(run('extract', ['udaharana', '--json'], env).status).toBe(0)
    expect(run('verify', ['--root', root], env).status).toBe(0)
    const printed = run('report', ['--root', root], env)
    expect(printed.status).toBe(0)
    expect({ repo: snapshot(root), captures: snapshot(site) }).toEqual(before)

    expect(run('report', ['--root', root, '--write'], env).status).toBe(0)
    const pack = join(root, '.scratch/content-v1/flags.md')
    expect(existsSync(pack)).toBe(true)
    expect(readFileSync(pack, 'utf8')).toBe(printed.stdout)
    expect(snapshot(root)).toEqual({ ...before.repo, [pack]: printed.stdout })
  })
})

describe('the network rule', () => {
  const NETWORK =
    /^(node:)?(http|https|http2|net|tls|dgram|dns|dns\/promises|inspector|inspector\/promises)$|^(undici|node-fetch|axios|got|ws|request|superagent|cross-fetch)(\/|$)/
  const IMPORTS = [
    /^\s*(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]/gm,
    /^\s*import\s*['"]([^'"]+)['"]/gm,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]

  it('holds for every tool: no network module imported, no request made', () => {
    const tools = readdirSync(TOOLS).filter((file) => file.endsWith('.mjs'))
    expect(tools).toEqual(
      expect.arrayContaining(['extract.mjs', 'verify.mjs', 'new.mjs', 'report.mjs']),
    )
    for (const tool of tools) {
      const source = readFileSync(join(TOOLS, tool), 'utf8')
      const imported = IMPORTS.flatMap((pattern) =>
        [...source.matchAll(pattern)].map((match) => match[1] ?? ''),
      )
      expect(imported.length, `${tool} imports something`).toBeGreaterThan(0)
      expect(
        imported.filter((specifier) => NETWORK.test(specifier)),
        tool,
      ).toEqual([])
      expect(source, tool).not.toMatch(
        /\bfetch\s*\(|\bWebSocket\b|\bXMLHttpRequest\b|\bEventSource\b|\b(?:curl|wget)\b/,
      )
    }
  })
})

describe('the shared modules', () => {
  const SHARED = ['cli.mjs', 'records.mjs', 'captures.mjs']
  const LOCAL_IMPORT = /^\s*import\b[^'"]*?\bfrom\s*['"]\.\/([^'"]+)['"]/gm

  it('are the only tool files a tool imports', () => {
    const tools = readdirSync(TOOLS).filter((file) => file.endsWith('.mjs'))
    expect(tools).toEqual(expect.arrayContaining(SHARED))
    for (const tool of tools) {
      const source = readFileSync(join(TOOLS, tool), 'utf8')
      const imported = [...source.matchAll(LOCAL_IMPORT)].map((match) => match[1] ?? '')
      expect(
        imported.filter((file) => !SHARED.includes(file)),
        tool,
      ).toEqual([])
    }
  })

  it('are libraries, not commands', () => {
    for (const file of SHARED)
      expect(readFileSync(join(TOOLS, file), 'utf8'), file).not.toMatch(/\brunTool\(import\.meta/)
  })
})

describe('new', { timeout: 30_000 }, () => {
  /** A made-up repo root with an empty data folder. */
  const emptyRepo = (name: string) => {
    const root = join(scratch, name)
    mkdirSync(join(root, 'src/content/data'), { recursive: true })
    return root
  }

  it('writes a record template in its kind’s folder, and the registry with it', () => {
    const root = emptyRepo('new-repo')
    const result = run('new', ['passage', 'example-sutra/1.12', '--root', root])
    expect(result.status).toBe(0)
    const file = join(root, 'src/content/data/passages/example-sutra/1.12.ts')
    const template = readFileSync(file, 'utf8')
    expect(template).toContain("id: 'example-sutra/1.12'")
    expect(template).toContain("work: 'example-sutra'")
    expect(template).toContain('order: [1, 12]')
    expect(readFileSync(join(root, 'src/content/generated/registry.ts'), 'utf8')).toContain(
      "'../data/passages/example-sutra/1.12'",
    )
    expect(result.stdout).toContain('src/content/data/passages/example-sutra/1.12.ts')
  })

  it('refuses a file that exists and an id that breaks the id rules', () => {
    const root = emptyRepo('new-refusals')
    expect(run('new', ['concept', 'example', '--root', root]).status).toBe(0)
    const again = run('new', ['concept', 'example', '--root', root])
    expect(again.status).toBe(2)
    expect(again.stderr).toContain('src/content/data/concepts/example.ts exists already')
    for (const [kind, id] of [
      ['concept', 'Vikshepa'],
      ['concept', 'vikṣepa'],
      ['reference', 'tomar 2024'],
      ['passage', 'yoga-sutra'],
      ['passage', 'Yoga-Sutra/1.30'],
      ['home', 'homepage'],
      ['colour', 'red'],
    ] as const) {
      const refused = run('new', [kind, id, '--root', root])
      expect(refused.status, `${kind} ${id}`).toBe(2)
    }
    expect(readdirSync(join(root, 'src/content/data'), { recursive: true })).toEqual([
      'concepts',
      'concepts/example.ts',
    ])
  })

  it('lays out every field of each kind in a template that typechecks', { timeout: 60_000 }, () => {
    const root = emptyRepo('new-every-kind')
    const files = CONTENT_KINDS.map((kind) => {
      const id = kind === 'home' ? 'home' : kind === 'passage' ? 'example-sutra/1.2' : 'example'
      expect(run('new', [kind, id, '--root', root]).status, kind).toBe(0)
      return { kind, file: join(root, 'src/content/data', KIND_FOLDERS[kind], `${id}.ts`) }
    })
    const program = ts.createProgram(
      files.map(({ file }) => file),
      {
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        verbatimModuleSyntax: true,
        types: [],
        paths: { '@/*': [`${resolve('src')}/*`] },
      },
    )
    const problems = ts
      .getPreEmitDiagnostics(program)
      .map((d) => `${d.file?.fileName}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`)
    expect(problems).toEqual([])

    // Every field of the record type (and of its provenance) appears, as code or as a comment.
    const checker = program.getTypeChecker()
    for (const { kind, file } of files) {
      const source = program.getSourceFile(file)
      if (!source) throw new Error(`${file} was not compiled`)
      let call: ts.CallExpression | undefined
      const findCall = (node: ts.Node) => {
        if (!call && ts.isCallExpression(node)) call = node
        ts.forEachChild(node, findCall)
      }
      findCall(source)
      const parameter = call && checker.getResolvedSignature(call)?.parameters[0]
      if (!call || !parameter) throw new Error(`${kind}: no define call`)
      const fields = checker
        .getTypeOfSymbolAtLocation(parameter, call)
        .getProperties()
        .map((property) => property.name)
      const text = source.getFullText()
      const missing = [
        ...fields,
        ...(kind === 'topic' ? [] : ['sources', 'edits', 'flags', 'drafted']),
      ].filter((field) => !new RegExp(`(^|[\\s{,/])${field}:`, 'm').test(text))
      expect(missing, kind).toEqual([])
    }
  })
})

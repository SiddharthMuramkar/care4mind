import { defineResourceList } from '@/content/schema'

// The two Text Books pages merged into one reading list (D11), with /indian-philosophy/ and
// /positive-psychology/ as groups of their own. Every book is a Reference (D09), by the id the
// References census gives it. The pages' courses are on Courses, and /text-books/'s
// inspirational books on Inspirational Books.
export default defineResourceList({
  kind: 'resource-list',
  slug: 'textbooks',
  title: 'Textbooks',
  groups: [
    {
      id: 'indian-and-western-textbooks',
      heading: 'Indian and Western Textbooks',
      items: [
        { type: 'reference', reference: 'hunt-ellis-2006' },
        { type: 'reference', reference: 'kellogg-2007' },
        { type: 'reference', reference: 'reed-2010' },
        { type: 'reference', reference: 'solso-2006' },
        { type: 'reference', reference: 'sternberg-2009' },
        { type: 'reference', reference: 'galotti-2008' },
        { type: 'reference', reference: 'stillings-1987' },
        { type: 'reference', reference: 'lopez-2021' },
        { type: 'reference', reference: 'rao-paranjpe-2016' },
        { type: 'reference', reference: 'parker-2015' },
        { type: 'reference', reference: 'cornelissen-2011' },
      ],
    },
    {
      id: 'indian-psychology-and-philosophy',
      heading: 'Indian Psychology & Philosophy Books',
      items: [
        { type: 'reference', reference: 'cornelissen-2014' },
        { type: 'reference', reference: 'rao-2008' },
        { type: 'reference', reference: 'rao-marwaha-2005' },
        { type: 'reference', reference: 'joshi-cornelissen-2004' },
        { type: 'reference', reference: 'cornelissen-2001' },
        { type: 'reference', reference: 'misra-mohanty-2001' },
        { type: 'reference', reference: 'salagame-2011' },
      ],
    },
    {
      id: 'positive-psychology',
      heading: 'Positive Psychology',
      items: [
        {
          type: 'reference',
          reference: 'compton',
          annotation:
            'This brief paperback presents in-depth coverage of the relatively new area of positive psychology. Topically organized, it looks at how positive psychology relates to stresses and health within such traditional research areas as developmental, clinical, personality, motivational, social, and behavioral psychology. The text is a perfect supplement for Introductory Psychology, Psychology of Adjustment, Health Psychology, or Social Psychology courses. It can also be used as a primary text in upper level courses, such as the Psychology of Happiness.',
        },
        {
          type: 'reference',
          reference: 'boniwell',
          annotation:
            'Discover the latest research findings and thinking on the topics of happiness, flow, optimism, motivation, character strengths, love and more.',
        },
      ],
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/text-books/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/text-books-2-2/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/indian-philosophy/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/positive-psychology/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Renamed: the list is titled “Textbooks”, not “Text Books”, the Library’s name for it. Its address is unchanged.',
      'Merged (D11): the two Text Books pages, each book once. The group “Indian and Western Textbooks” holds the eleven books /text-books-2-2/ lists under that heading, in its order; they include the six /text-books/ lists under its tab of that name, in the same order.',
      'Left out: the heading “Psychology Books”, which /text-books/ puts inside its “Indian and Western Textbooks” tab, above the same six books.',
      'Merged: /indian-philosophy/ lists the seven books of /text-books/’s “Indian Psychology & Philosophy Books” tab, under the same heading and in the same order. They are one group, each book once.',
      'Merged: the two books of /positive-psychology/, each with its description as its annotation; each book’s title and “by” line there are its Reference. The page has no heading, so the group is headed by the page’s title.',
      'Moved to the other reading lists: the IGNOU and NIOS courses both pages list under “Psychology Courses” to Courses, and /text-books/’s “Inspirational Books” tab to Inspirational Books.',
      'Interface text dropped: the link labels “Read Online”, “Learn More”, “Google Books” and “More Info”. Each book’s link, and each linked title on /positive-psychology/, is on its Reference.',
      'Dropped, and flagged on each book’s Reference (References census): the five “More Info” links to “#”, on both /text-books/ and /indian-philosophy/.',
      'Left out (D18): the 13 cover images beside these books on /text-books/, and the 7 on /indian-philosophy/. /text-books/ has 24 images in all: the other 11, beside its courses and its inspirational books, are listed on Courses and Inspirational Books. /text-books-2-2/ and /positive-psychology/ have none.',
    ],
    flags: [
      {
        for: 'project-owner',
        note: 'Some book descriptions on the current site’s reading lists read like publishers’ blurbs. If they were copied, they may need credit, or permission to publish. Kept as the pages have them; nothing was looked up.',
      },
    ],
  },
})

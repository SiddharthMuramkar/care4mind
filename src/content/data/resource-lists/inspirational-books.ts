import { defineResourceList } from '@/content/schema'

// /inspirational-books/, with /text-books/'s "Inspirational Books" tab merged in (D11). Every
// book is a Reference (D09), by the id the References census gives it; the line the page writes
// under each book is its annotation.
export default defineResourceList({
  kind: 'resource-list',
  slug: 'inspirational-books',
  title: 'Inspirational Books',
  groups: [
    {
      id: 'inspirational-books',
      heading: 'Inspirational Books',
      items: [
        {
          type: 'reference',
          reference: 'gupta-2013',
          annotation:
            'This book is a collection of recorded conversations of Sri Ramakrishna with his disciples, devotees and visitors. Originally written in Bengali, it was translated in English by Swami Nikhilananda.',
        },
        {
          type: 'reference',
          reference: 'mascaro-1994-gita',
          annotation:
            'Juan Mascaró’s translation of The Bhagavad Gita captures the extraordinary aural qualities of the original Sanskrit text that encompasses the whole spiritual struggle of a human soul.',
        },
        {
          type: 'reference',
          reference: 'mascaro-1994-upanisads',
          annotation:
            'This translation of the Upanishads by Juan Mascaro reveals the spiritual wisdom of the rich ancient Indian texts.',
        },
        {
          type: 'reference',
          reference: 'nisargadatta-2008',
          annotation:
            'Sri Nisargadatta Maharaj’s mission was to guide the individual to an understanding of his true nature and the timelessness of being. This book is a collection of his teachings and preserves his dialogues with the followers seeking his guidance. It is a testament to the uniqueness of the seer’s life and work.',
        },
        {
          type: 'reference',
          reference: 'yogananda-1946-1975',
          annotation:
            'In this modern spiritual classic, Paramahansa Yogananda narrates the inspiring chronicle of his life which gives the reader a penetrating and unforgettable look at the ultimate mysteries of human existence. It is a beautifully written account of an exceptional life and a profound introduction to the ancient science of Yoga and its time-honored tradition of meditation.',
        },
        {
          type: 'reference',
          reference: 'nyinche-1999',
          annotation:
            'In this book, the most basic principles of Tibetan Buddhism are presented in commonsense terms, using down-to-earth examples—making this a perfect handbook for beginners as well as an excellent companion for long-time students.',
        },
        {
          type: 'reference',
          reference: 'gandhi-1993',
          annotation:
            'In this classic autobiography, Mahatma Gandhi recounts the story of his life and how he developed his concept of active nonviolent resistance, which propelled the Indian struggle for independence and countless other non-violent struggles of the twentieth century.',
        },
        {
          type: 'reference',
          reference: 'brunton-1934',
          annotation:
            'Paul Brunton, in this book, narrates his journey around India, living among yogis, mystics, and gurus, some of whom he found convincing, others not and how finally meeting the great sage Sri Ramana Maharashi, he found peace and tranquility.',
        },
        {
          type: 'reference',
          reference: 'brunton-2009',
          annotation:
            'This book places before the reader, three chapters from Paul Brunton’s book “A search in Secret India”, recounting the story of his retreat in the foot of Arunchala and his extraordinary experiences in the company of Sri Ramana Maharashi.',
        },
        {
          type: 'reference',
          reference: 'peck-1978',
          annotation:
            'In this book, psychiatrist Dr M. Scott Peck suggests ways for confronting and solving our problems that enable us to grow both mentally and spiritually. This book showcases ways to embrace reality and yet achieve serenity and a richer existence.',
        },
        {
          type: 'reference',
          reference: 'khalil-2001',
          annotation:
            'This Khalil Gibran’s masterpiece is a collection of poetic essays that are philosophical, spiritual, and, above all, inspirational and range from love, marriage, children to self-knowledge, religion and death.',
        },
        {
          type: 'reference',
          reference: 'bach-1977',
          annotation:
            'The novel questions the reader’s view of reality, proposing that what we call reality is merely an illusion we create for learning and enjoyment.',
        },
        {
          type: 'reference',
          reference: 'frankl-2008',
          annotation:
            'In this book, based on his own experience in a Nazi death camp, psychiatrist Viktor Frankl argues that we cannot avoid suffering but we can choose how to cope with it, find meaning in it, and move forward with renewed purpose. Frankl’s theory, known as logotherapy, holds that our primary drive in life is not pleasure, as Freud maintained, but the discovery and pursuit of what we personally find meaningful.',
        },
      ],
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/inspirational-books/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/text-books/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Merged (D11): /text-books/’s “Inspirational Books” tab lists eight of this page’s thirteen books (Gupta, both Mascaro books, Nisargadatta, Yogananda, Gandhi, Frankl and Khalil), more briefly. Each book is kept once, in this page’s order.',
      'The page has no heading, so its one group is headed by the page’s title, which is also the title of /text-books/’s tab.',
      'Each book’s first line on the page is its Reference; the line under it is its annotation.',
      'Typos fixed in the annotations: “long-time students.]” → “long-time students.”, “This books places” → “This book places”.',
      'Interface text dropped: the “Buy Now” link labels on /text-books/. Each book’s link is on its Reference.',
      'Left out (D18): the 8 cover images beside these books on /text-books/. /inspirational-books/ has none.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'Both annotations of Paul Brunton’s books write “Sri Ramana Maharashi”, and the second writes “the foot of Arunchala”, while the page’s line for that book writes “The Maharshi and his message”. Kept as the page writes them; confirm the spellings. Nothing was looked up.',
        decidedBy: 'references',
      },
      {
        for: 'research-editor',
        note: 'The annotation of Brunton (2009) calls his 1934 book “A search in Secret India”; the page’s line for Brunton (1934) titles it “A search into secret India”. Both kept as the page has them; confirm the title. Nothing was looked up.',
        decidedBy: 'references',
      },
      {
        for: 'project-owner',
        note: 'Some book descriptions on the current site’s reading lists read like publishers’ blurbs. If they were copied, they may need credit, or permission to publish. Kept as the pages have them; nothing was looked up.',
      },
    ],
  },
})

import { defineTopic } from '@/content/schema'

// Topics are provisional until the client confirms them. Their names come from the
// design notes. This one names two terms, so they stay in the English name.
export default defineTopic({
  kind: 'topic',
  slug: 'self',
  name: { english: 'Self and person (ātman · jīva)' },
  order: 1,
})

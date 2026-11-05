import { defineTopic } from '@/content/schema'

// Topics are provisional until the client confirms them. Their names come from the
// design notes.
export default defineTopic({
  kind: 'topic',
  slug: 'mind',
  name: { english: 'Mind: states and obstacles', term: { iast: 'citta', ascii: ['chitta'] } },
  order: 2,
})

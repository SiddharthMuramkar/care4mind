import { defineTopic } from '@/content/schema'

// Topics are provisional (D03; planning ticket 13 confirms them). Their names come from the
// design notes, B3.
export default defineTopic({
  kind: 'topic',
  slug: 'mind',
  name: { english: 'Mind: states and obstacles', term: { iast: 'citta', ascii: ['chitta'] } },
  order: 2,
})

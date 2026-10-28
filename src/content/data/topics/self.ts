import { defineTopic } from '@/content/schema'

// Topics are provisional (D03; planning ticket 13 confirms them). Their names come from the
// design notes, B3. This one names two terms, so they stay in the English name.
export default defineTopic({
  kind: 'topic',
  slug: 'self',
  name: { english: 'Self and person (ātman · jīva)' },
  order: 1,
})

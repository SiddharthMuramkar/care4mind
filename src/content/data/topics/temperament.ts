import { defineTopic } from '@/content/schema'

// Topics are provisional (D03; planning ticket 13 confirms them). Their names come from the
// design notes, B3.
export default defineTopic({
  kind: 'topic',
  slug: 'temperament',
  name: { english: 'Temperament (guṇa)' },
  order: 5,
})

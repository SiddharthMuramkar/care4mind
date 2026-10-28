import { defineTopic } from '@/content/schema'

// Topics are provisional (D03; planning ticket 13 confirms them). Their names come from the
// design notes, B3.
export default defineTopic({
  kind: 'topic',
  slug: 'practice',
  name: { english: 'Practice and progress', term: { iast: 'sādhana', ascii: ['Sadhana'] } },
  order: 3,
})

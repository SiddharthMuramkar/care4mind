import { defineTopic } from '@/content/schema'

// Topics are provisional until the client confirms them. Their names come from the
// design notes.
export default defineTopic({
  kind: 'topic',
  slug: 'practice',
  name: { english: 'Practice and progress', term: { iast: 'sādhana', ascii: ['Sadhana'] } },
  order: 3,
})

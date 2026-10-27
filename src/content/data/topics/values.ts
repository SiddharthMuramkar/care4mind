import { defineTopic } from '@/content/schema'

// Topics are provisional (D03; planning ticket 13 confirms them). Their names come from the
// design notes, B3. Ticket 10 adds this topic's introduction: the yama–niyama section the
// four values pages share, stored once.
export default defineTopic({
  kind: 'topic',
  slug: 'values',
  name: { english: 'Values: yama and niyama' },
  order: 4,
})

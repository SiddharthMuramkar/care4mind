/**
 * What /proposals/ lists for the Project owner's sign-off: the built proposals, each
 * only while its flag is on, and one described but not built. Interface text: each entry says
 * what it adds, what it costs in speed and upkeep, and how it is switched off.
 */
import type { Features } from '@/config/features'

export interface Proposal {
  key: 'concept-map' | 'start-here' | 'whats-on-your-mind' | 'audio-pronunciation'
  name: string
  built: boolean
  adds: string
  speed: string
  upkeep: string
  off: string
}

const CONCEPT_MAP: Proposal = {
  key: 'concept-map',
  name: 'Concept map',
  built: true,
  adds: 'The Concepts on one printed plate, set round a circle by topic and joined where two quote the same verse or text, or cite the same rarely cited Reference. Pointing at a Concept lights what it is joined to, filters pick out one kind of connection or a topic, and a list says everything the plate shows, in words.',
  speed:
    'One page of its own. Its layout is worked out when the site is built, so the browser runs no layout code; only the filter buttons run in the browser.',
  upkeep: 'None by hand: a new Concept, verse or Reference joins the map when the content changes.',
  off: 'One setting, FEATURE_CONCEPT_MAP=0, with no code change: the map and every link to it go. The live site leaves it off until you approve it.',
}

const START_HERE: Proposal = {
  key: 'start-here',
  name: 'Start here',
  built: true,
  adds: 'A page for a first-time reader, linked from the header: what Indian psychology is, how the site is organised, how to read Sanskrit names, three Concepts to read first, and where to call for help. Every word of it is drafted, for the Research editor to check.',
  speed: 'One page of its own; the header and the Menu gain one small link.',
  upkeep:
    'Its three first reads and its pronunciation notes are written by hand, so a renamed Concept or a changed spelling means editing it.',
  off: 'One setting, FEATURE_START_HERE=0, with no code change: the page and its header link go. The live site leaves it off until you approve it.',
}

const WHATS_ON_YOUR_MIND: Proposal = {
  key: 'whats-on-your-mind',
  name: 'What’s on your mind?',
  built: true,
  adds: 'Six chips under the homepage hero, in everyday words — “I can’t focus”, “My mind feels scattered” and the like — each leading to the Concept that speaks to it, for a visitor who doesn’t yet know which Sanskrit name to look for. Each names an everyday experience, never a condition or a diagnosis. The wording is drafted for the Project owner, and which Concept each chip leads to for the Research editor.',
  speed: 'No page of its own: six links on the homepage, and nothing runs in the browser.',
  upkeep:
    'The six chips and their Concepts are written by hand in the home record, so a renamed Concept or a changed starting point means editing it.',
  off: 'One setting, FEATURE_WHATS_ON_YOUR_MIND=0, with no code change: the chips go. The live site leaves it off until you approve it.',
}

const AUDIO: Proposal = {
  key: 'audio-pronunciation',
  name: 'Audio pronunciation',
  built: false,
  adds: 'A button beside a Sanskrit word that plays how it is said, for readers who don’t yet know the sounds the letters stand for.',
  speed: 'Nothing until it is pressed: each recording would load only when played.',
  upkeep:
    'A recording of every Sanskrit word on the site, made and checked by someone who knows the pronunciation, and another for each word added later.',
  off: 'Nothing to switch off: it is described, not built. Built, it would get a setting of its own, like the ones above.',
}

/** The proposals this build lists, in order. */
export function proposalsFor(flags: Features): Proposal[] {
  return [
    ...(flags.conceptMap ? [CONCEPT_MAP] : []),
    ...(flags.startHere ? [START_HERE] : []),
    ...(flags.whatsOnYourMind ? [WHATS_ON_YOUR_MIND] : []),
    AUDIO,
  ]
}

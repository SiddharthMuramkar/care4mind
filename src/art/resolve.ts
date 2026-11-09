import type { Features } from '@/config/features'

import {
  conceptArt,
  questionnaireArt,
  sectionArt,
  topicArt,
  workArt,
  type PictureId,
  type SectionKey,
  type TopicPicture,
} from './assign'
import type { ArtId } from './registry'
import type { ArtRecord } from './types'

/** A page head, or a topic's card: pages already hold what each kind needs, so nothing here waits on content. */
export type ArtTarget =
  | { kind: 'section'; key: SectionKey }
  /** A topic's page, which shows its Frontispiece. */
  | { kind: 'topic'; slug: string }
  /** A topic's card, wherever it appears: its Sticker, or that Sticker's Interim picture. */
  | { kind: 'topic-card'; slug: string }
  /** `topic` is the Concept's primary topic. */
  | { kind: 'concept'; slug: string; topic: string }
  /** `firstConcept` is the first of its Concepts, by name. */
  | { kind: 'questionnaire'; slug: string; firstConcept?: string }
  | { kind: 'work'; slug: string }

/** A card that can carry its own picture. */
export type OwnArtTarget =
  | { kind: 'concept'; slug: string }
  | { kind: 'questionnaire'; slug: string }
  | { kind: 'work'; slug: string }

/** The picture lookups over a list of records and a build's flags, so tests can pass their own. */
export function createArt(records: readonly ArtRecord[], flags: Pick<Features, 'draftArt'>) {
  const byId: ReadonlyMap<string, ArtRecord> = new Map(records.map((record) => [record.id, record]))

  /** A slot with no record is absent, and an unapproved record counts only while drafts show. */
  function usable(id: PictureId | undefined): ArtRecord | undefined {
    const record = id === undefined ? undefined : byId.get(id)
    return record && (record.approved || flags.draftArt) ? record : undefined
  }

  /** The first of these that can show. Every list ends in a picture the registry holds. */
  function firstUsable(...ids: (PictureId | undefined)[]): ArtRecord {
    for (const id of ids) {
      const record = usable(id)
      if (record) return record
    }
    throw new Error(`None of these pictures can show: ${ids.join(', ')}.`)
  }

  function topicOf(slug: string): TopicPicture {
    const picture = topicArt[slug]
    if (!picture) throw new Error(`No topic has the slug “${slug}”.`)
    return picture
  }

  return {
    /** The record of the picture with this id. */
    art(id: ArtId): ArtRecord {
      const record = byId.get(id)
      if (!record) throw new Error(`No picture has the id “${id}”.`)
      return record
    },

    /** The picture for a page head or a topic's card, following the Interim pictures. */
    artFor(target: ArtTarget): ArtRecord {
      switch (target.kind) {
        case 'section': {
          const { art: own, interim } = sectionArt[target.key]
          return firstUsable(own, interim)
        }
        case 'topic':
          return firstUsable(topicOf(target.slug).frontispiece)
        case 'topic-card': {
          const { sticker, interim } = topicOf(target.slug)
          return firstUsable(sticker, interim)
        }
        case 'concept': {
          const { sticker, interim } = topicOf(target.topic)
          return firstUsable(conceptArt[target.slug], sticker, interim)
        }
        case 'questionnaire':
          return firstUsable(
            questionnaireArt[target.slug],
            target.firstConcept === undefined ? undefined : conceptArt[target.firstConcept],
            'sticker-clipboard',
          )
        case 'work':
          return firstUsable(workArt[target.slug], 'sticker-book-ornate')
      }
    },

    /** A card's own picture, or nothing: an Interim picture never stands on a card. */
    ownArt(target: OwnArtTarget): ArtRecord | undefined {
      switch (target.kind) {
        case 'concept':
          return usable(conceptArt[target.slug])
        case 'questionnaire':
          return usable(questionnaireArt[target.slug])
        case 'work':
          return usable(workArt[target.slug])
      }
    },
  }
}

import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

import { notFound } from 'next/navigation'
import { ImageResponse } from 'next/og'

import { art, artFor, isSectionKey, type ArtRecord } from '@/art'
import { siteConfig as config } from '@/config/site'
import { concepts, questionnaires } from '@/content'
import { cardFaces } from '@/fonts/card-faces'
import { shareCardText } from '@/lib/metadata'

/** The size every share card is drawn at: the one WhatsApp, LinkedIn and X all crop well. */
export const CARD_SIZE = { width: 1200, height: 630 }

/** Press, in paper. Satori cannot read CSS variables, so a unit test keeps these equal to the tokens. */
export const CARD_COLOURS = {
  '--color-surface': '#eadbb6',
  '--color-surface-ink': '#1d1a2e',
  '--color-surface-muted': '#5a4a2e',
  '--color-surface-rule': '#8c7a55',
}
const PAPER = CARD_COLOURS['--color-surface']
const INK = CARD_COLOURS['--color-surface-ink']
const MUTED = CARD_COLOURS['--color-surface-muted']
const RULE = CARD_COLOURS['--color-surface-rule']

/** The text keeps to the left two thirds, so it can never reach the picture at x 800. */
const TEXT_WIDTH = 656
const PICTURE_SIZE = 320
/** Puts the picture's top edge level with the top of the title, below the name and its rule. */
const PICTURE_TOP = 187

/** The picture on the share card of the public page whose route pattern is `pattern`. */
export async function cardPicture(pattern: string, slug: string): Promise<ArtRecord> {
  switch (pattern) {
    case '/':
    case '/proposals/':
    case '/credits/':
    case '/credits/sources/':
    case '/log-in/':
    case '/sign-up/':
    case '/privacy/':
      return art('emblem-ring')
    case '/concepts/':
      return artFor({ kind: 'section', key: 'concepts' })
    case '/concepts/map/':
      return artFor({ kind: 'section', key: 'map' })
    case '/texts/':
      return artFor({ kind: 'section', key: 'texts' })
    case '/questionnaires/':
      return artFor({ kind: 'section', key: 'questionnaires' })
    case '/library/':
      return artFor({ kind: 'section', key: 'library' })
    case '/library/references/':
      return artFor({ kind: 'section', key: 'references' })
    case '/start/':
      return artFor({ kind: 'section', key: 'start' })
    case '/search/':
      return artFor({ kind: 'section', key: 'search' })
    // Each Library list and page has a section picture under its own slug.
    case '/library/[slug]/':
      if (!isSectionKey(slug)) throw new Error(`The Library's page ${slug} has no Sticker.`)
      return artFor({ kind: 'section', key: slug })
    case '/topics/[slug]/':
      return artFor({ kind: 'topic', slug })
    case '/texts/[slug]/':
      return artFor({ kind: 'work', slug })
    case '/concepts/[slug]/': {
      const concept = await concepts.get(slug)
      if (!concept) notFound()
      return artFor({ kind: 'concept', slug, topic: concept.topic.slug })
    }
    case '/questionnaires/[slug]/':
    case '/questionnaires/[slug]/take/': {
      const questionnaire = await questionnaires.get(slug)
      if (!questionnaire) notFound()
      return artFor({ kind: 'questionnaire', slug, firstConcept: questionnaire.concepts[0]?.slug })
    }
    default:
      throw new Error(`No share card picture for “${pattern}” (“${slug}”).`)
  }
}

/** A picture's 320 px copy as a data URI, the form Satori draws without fetching anything. */
async function cardPictureSrc({ src }: ArtRecord): Promise<string> {
  const file = src.replace('/art/', '')
  const data = await readFile(join(process.cwd(), 'art', 'cards', file), 'base64')
  return `data:image/${extname(file) === '.jpg' ? 'jpeg' : 'png'};base64,${data}`
}

/**
 * The share card of the public page whose route pattern is `pattern` (with `slug` in its
 * `[slug]`): ink on paper, the site's name over a rule, then the page's name and its summary
 * beside the page's picture.
 */
export async function shareCard(pattern: string, slug = ''): Promise<ImageResponse> {
  const { title, description } = await shareCardText(pattern.replace('[slug]', slug))
  const picture = await cardPicture(pattern, slug)
  const src = await cardPictureSrc(picture)
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        padding: '64px 80px',
        background: PAPER,
        color: INK,
        fontFamily: 'Playfair Text, Tiro Devanagari Sanskrit',
      }}
    >
      <div style={{ fontSize: 32, color: MUTED, letterSpacing: 2 }}>{config.name}</div>
      <div style={{ height: 2, background: RULE, marginTop: 20, marginBottom: 56 }} />
      <div
        style={{
          fontFamily: 'Playfair Display, Tiro Devanagari Sanskrit',
          fontWeight: 500,
          fontSize: 56,
          lineHeight: 1.1,
          width: TEXT_WIDTH,
          display: 'block',
          lineClamp: 3,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 32,
          width: TEXT_WIDTH,
          fontSize: 32,
          lineHeight: 1.4,
          color: MUTED,
          display: 'block',
          lineClamp: 4,
        }}
      >
        {description}
      </div>
      {/* A Plate is a circle on the page too; the file itself is never cut. Satori has no next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={PICTURE_SIZE}
        height={PICTURE_SIZE}
        style={{
          position: 'absolute',
          left: 800,
          top: PICTURE_TOP,
          borderRadius: picture.family === 'plate' ? PICTURE_SIZE / 2 : 0,
        }}
      />
    </div>,
    { ...CARD_SIZE, fonts: await cardFaces() },
  )
}

'use client'

import { Autocomplete } from '@base-ui/react/autocomplete'
import { Dialog } from '@base-ui/react/dialog'
import { ScrollArea } from '@base-ui/react/scroll-area'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  type RefObject,
  startTransition,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { CloseGlyph, SearchGlyph } from '@/components/nav/glyphs'
import { turnForward } from '@/components/PageTurn'
import { search } from '@/lib/search/client'
import type { SearchHit } from '@/lib/search/search'

import {
  groupByKind,
  langOf,
  matchLabel,
  resultCount,
  shownVariant,
  SUGGESTIONS,
  type HitGroup,
} from './kinds'
import styles from './Palette.module.css'
import { closeOnArrival, isFieldReady, paletteState, setFieldReady, subscribe } from './palette'

export interface PaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Where focus goes as it closes: whatever opened it. */
  finalFocus: () => HTMLElement | false | null
  /** The results page's path, for "All results". */
  searchPath: Route
}

/** The most hits of one kind the palette lists, and the most in all; the results page has the rest. */
const PER_KIND = 5
const IN_ALL = 24

/** The groups the palette lists, each cut to its share. */
function listed(hits: readonly SearchHit[]): (HitGroup & { items: SearchHit[] })[] {
  let room = IN_ALL
  return groupByKind(hits)
    .map((group) => {
      const items = group.hits.slice(0, Math.min(PER_KIND, room))
      room -= items.length
      return { ...group, items }
    })
    .filter(({ items }) => items.length > 0)
}

/**
 * The command palette (design C2): a Base UI Dialog holding an inline Autocomplete, set as a
 * catalogue card. Results come grouped by kind as you type, each saying which spelling matched;
 * the arrow keys move through them and Enter turns to the chosen page. Escape closes it and
 * focus goes back to whatever opened it.
 */
export function Palette({ open, onOpenChange, finalFocus, searchPath }: PaletteProps) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <Dialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Viewport className={styles.viewport}>
          <Dialog.Popup className={styles.card} initialFocus={input} finalFocus={finalFocus}>
            <Dialog.Title className={styles.title}>Search</Dialog.Title>
            <Finder input={input} searchPath={searchPath} close={() => onOpenChange(false)} />
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

interface FinderProps {
  input: RefObject<HTMLInputElement | null>
  searchPath: Route
  close: () => void
}

/** What a query found, once search has answered it. */
interface Answer {
  query: string
  hits: SearchHit[]
}

function Finder({ input, searchPath, close }: FinderProps) {
  // What it opened with (a query handed over, or typed before the field was there), until the
  // field is typed in.
  const handed = useSyncExternalStore(
    subscribe,
    () => paletteState().query,
    () => '',
  )
  const [own, setOwn] = useState<string | null>(null)
  const query = own ?? handed
  const [answer, setAnswer] = useState<Answer>({ query: '', hits: [] })
  const [failed, setFailed] = useState(false)
  const keysId = useId()
  const router = useRouter()

  useEffect(() => () => setFieldReady(false), [])

  const typed = query.trim()
  useEffect(() => {
    if (typed === '') return
    let current = true
    // In a task of its own, after the field has shown what was typed; the list follows.
    const id = setTimeout(() => {
      search(typed).then(
        (hits) => {
          if (current) startTransition(() => setAnswer({ query: typed, hits }))
        },
        () => {
          if (current) setFailed(true)
        },
      )
    })
    return () => {
      current = false
      clearTimeout(id)
    }
  }, [typed])

  // Until search answers, the last answer stays, so the list doesn't flicker as you type.
  const hits = typed === '' ? [] : answer.hits
  const answered = typed !== '' && answer.query === typed
  const groups = listed(hits)

  const status =
    typed === '' ? null : failed ? (
      'Search could not load: try All results.'
    ) : answered ? (
      <>
        {hits.length === 0 ? 'No results' : resultCount(hits.length)}
        <span className={styles.hidden}> for “{typed}”</span>
      </>
    ) : (
      'Searching…'
    )

  const choose = (text: string) => {
    setOwn(text)
    input.current?.focus()
  }

  return (
    <Autocomplete.Root
      open
      inline
      items={groups}
      filter={null}
      autoHighlight="always"
      keepHighlight
      value={query}
      onValueChange={(value, details) => {
        // Choosing a result fills the field with its title; the page is already turning.
        if (details.reason !== 'item-press') setOwn(value)
      }}
      onOpenChange={(next, details) => {
        if (!next && details.reason === 'escape-key') close()
      }}
      itemToStringValue={(hit: SearchHit) => hit.title}
      // The chosen result's page is fetched ahead, so Enter turns to it at once. (Next.js 16.4
      // turns no page when a navigation has to wait for its page: the turn's types are lost.)
      onItemHighlighted={(hit: SearchHit | undefined) => {
        // Each result's path, made by hrefFor() in the content module.
        if (hit) router.prefetch(hit.href as Route)
      }}
    >
      <div className={styles.field}>
        <SearchGlyph className={styles.glyph} />
        <Autocomplete.Input
          ref={input}
          className={styles.input}
          aria-label="Search Care4Mind"
          aria-describedby={keysId}
          placeholder="A Concept, a term, a verse, an author…"
          autoComplete="off"
          spellCheck={false}
          onFocus={(event) => {
            if (isFieldReady()) return
            // Holding what was typed ahead or handed over: the caret goes after it.
            const { length } = event.currentTarget.value
            event.currentTarget.setSelectionRange(length, length)
            setFieldReady(true)
          }}
        />
        <Dialog.Close className={styles.close} aria-label="Close search">
          <CloseGlyph className={styles.closeGlyph} />
        </Dialog.Close>
      </div>
      <span className={styles.rule} aria-hidden />

      <ScrollArea.Root className={styles.scroll}>
        <ScrollArea.Viewport className={styles.scrollViewport}>
          <ScrollArea.Content className={styles.scrollContent}>
            {/* Not Autocomplete.Empty, a live region of its own: Status alone announces. */}
            {groups.length === 0 && (typed === '' || answered) ? (
              <div className={styles.empty}>
                <Suggestions
                  lead={
                    typed === ''
                      ? 'Search by any spelling: IAST, Devanagari or plain letters.'
                      : `Nothing found for “${typed}”.`
                  }
                  choose={choose}
                />
              </div>
            ) : null}
            <Autocomplete.List className={styles.list}>
              {(group: HitGroup & { items: SearchHit[] }) => (
                <Autocomplete.Group key={group.kind} items={group.items} className={styles.group}>
                  <Autocomplete.GroupLabel className={styles.groupLabel}>
                    {group.heading}
                    <span className={styles.leader} aria-hidden />
                    <span className={styles.groupCount} aria-hidden>
                      {group.hits.length}
                    </span>
                  </Autocomplete.GroupLabel>
                  <Autocomplete.Collection>
                    {(hit: SearchHit) => <Result key={hit.id} hit={hit} close={close} />}
                  </Autocomplete.Collection>
                </Autocomplete.Group>
              )}
            </Autocomplete.List>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className={styles.scrollbar}>
          <ScrollArea.Thumb className={styles.thumb} />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      <div className={styles.foot}>
        <Autocomplete.Status className={styles.status}>{status}</Autocomplete.Status>
        <p id={keysId} className={styles.hidden}>
          The up and down arrows move through the results, Enter opens one, Escape closes search.
        </p>
        <p className={styles.keys} aria-hidden>
          <kbd>↑</kbd>
          <kbd>↓</kbd> move <kbd>↵</kbd> open <kbd>esc</kbd> close
        </p>
        {typed === '' ? null : (
          // The results page's own path, from hrefFor() on the server, with the query.
          <Link
            href={`${searchPath}?q=${encodeURIComponent(typed)}` as Route}
            className={styles.all}
            onClick={close}
            prefetch={false}
          >
            All results
          </Link>
        )}
      </div>
    </Autocomplete.Root>
  )
}

/** One result: a link to its page, with what it sits in and the spelling that found it. */
function Result({ hit, close }: { hit: SearchHit; close: () => void }) {
  const variant = shownVariant(hit)
  const titleLang = langOf(hit.title)
  const variantLang = variant === undefined ? undefined : langOf(variant)
  const parentLang = hit.parent === undefined ? undefined : langOf(hit.parent)
  return (
    <Autocomplete.Item
      value={hit}
      className={styles.item}
      onClick={(event) => {
        // A place on this page: close now. Another page: the card fades as the page turns, and
        // closes once the new page is shown. (Closing as the link is followed can cost the turn.)
        if (new URL(hit.href, location.href).pathname === location.pathname) close()
        else {
          event.currentTarget.closest('[role="dialog"]')?.setAttribute('data-chosen', '')
          closeOnArrival()
        }
      }}
      // Each result's path, made by hrefFor() in the content module.
      render={<Link href={hit.href as Route} prefetch={false} transitionTypes={turnForward} />}
    >
      <span className={styles.itemTitle} {...(titleLang ? { lang: titleLang } : {})}>
        {hit.title}
      </span>
      {hit.parent || variant ? (
        <span className={styles.itemMeta}>
          {hit.parent ? (
            <span>
              in <span {...(parentLang ? { lang: parentLang } : {})}>{hit.parent}</span>
            </span>
          ) : null}
          {variant ? (
            <span className={styles.chip}>
              {matchLabel(hit)}{' '}
              <i {...(variantLang ? { lang: variantLang } : {})} className={styles.variant}>
                {variant}
              </i>
            </span>
          ) : null}
        </span>
      ) : null}
    </Autocomplete.Item>
  )
}

/** Real searches to try, each filling in the field. */
function Suggestions({ lead, choose }: { lead: string; choose: (query: string) => void }) {
  return (
    <div className={styles.suggest}>
      <p className={styles.lead}>{lead}</p>
      <p className={styles.tries}>
        <span className={styles.try}>Try</span>
        {SUGGESTIONS.map(({ query, lang }) => (
          <button
            key={query}
            type="button"
            className={styles.suggestion}
            onClick={() => choose(query)}
            {...(lang ? { lang } : {})}
          >
            {query}
          </button>
        ))}
      </p>
    </div>
  )
}

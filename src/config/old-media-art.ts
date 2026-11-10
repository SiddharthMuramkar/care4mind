/**
 * Where each surviving picture from the old site's media library now lives: a WordPress id to
 * its new file under `public/`. The redirect table sends every address of that id, each of its
 * sizes included, to the one file. An id with no entry here leads to the page that showed it.
 *
 * Plain data with no `@/` imports: next.config.ts loads this file, through redirects.ts, with a
 * loader that can't follow them. The unit test (tests/unit/redirects.test.ts) holds each file
 * to the art registry and each kept picture to an entry.
 */
export const artFileOf: Readonly<Record<number, string>> = {
  // The Emblem, and the three earlier copies of it that the site no longer serves.
  604: '/art/emblem/emblem-ring.png',
  643: '/art/emblem/emblem-ring.png',
  624: '/art/emblem/emblem-ring.png',
  614: '/art/emblem/emblem-ring.png',
  498: '/art/emblem/emblem-mark.png',
  // Stickers.
  511: '/art/stickers/cosmos.png',
  514: '/art/stickers/mind-tools.png',
  510: '/art/stickers/mind-swirl.png',
  509: '/art/stickers/mind-dome.png',
  513: '/art/stickers/book-ornate.png',
  505: '/art/stickers/book-clasp.png',
  512: '/art/stickers/meditation.png',
  508: '/art/stickers/gear.png',
  515: '/art/stickers/clipboard.png',
  // Plates.
  464: '/art/plates/jeweller.jpg',
  466: '/art/plates/sculptor.jpg',
  468: '/art/plates/farmers.jpg',
  463: '/art/plates/jeweller-woman.jpg',
  497: '/art/plates/karma-yoga.jpg',
  461: '/art/plates/painter-bowl.jpg',
  462: '/art/plates/painter-birds.jpg',
  467: '/art/plates/sage-paints-mind.jpg',
  460: '/art/plates/sage-lights-mind.jpg',
  457: '/art/plates/tree-of-mind.jpg',
  499: '/art/plates/motifs.jpg',
  // The old Karma Yoga picture: a page rather than a file, since the cycle is redrawn there.
  38: '/questionnaires/karmayoga-scale/#karma-cycle',
}

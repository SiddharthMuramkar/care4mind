/**
 * The old site's URL inventory: every address the current site served that its saved copies show.
 * FR-07 holds the new site to answering each one with its page, or one 301 to it.
 *
 * Sources: the saved copies of the current site (its pages and posts as the WordPress REST
 * API listed them, kept apart from this repo) for the pages below, and the sitemap list
 * FR-07 cites for the archives. The sitemap's two author archives are named here only as
 * the pattern the redirect table matches, so no username is ever written down. Its media
 * addresses and the posts' `?p=` shortlinks are read from the same saved copies.
 *
 * This file is data, not a table of where anything goes: the redirect table declares each
 * moved page's new home, and the tests hold every address here to the route registry.
 */

/**
 * The current site's 33 pages and 6 posts, front page first. Two of them, `/` and
 * `/concepts/`, keep their addresses on the new site.
 */
export const oldPagesAndPosts: readonly string[] = [
  '/',
  '/home/',
  '/home-2/',
  '/sample-page/',
  '/blog/',
  '/concepts/',
  '/triguna/',
  '/methods/',
  '/resources/',
  '/text-books/',
  '/text-books-2-2/',
  '/inspirational-books/',
  '/webpages-and-av-material/',
  '/indian-philosophy/',
  '/positive-psychology/',
  '/institutes/',
  '/surveys/',
  '/dosha-survey/',
  '/karta-2/',
  '/brahmavihara/',
  '/frienorfoeofself/',
  '/sthitaprajna/',
  '/vikshepa/',
  '/knowyourmind/',
  '/momentumofspiritualpractice/',
  '/upavikshepaprofiling/',
  '/panchkleshavikaarprofiling/',
  '/spiritualpractitionerprofiling/',
  '/fivestepsofperfectionprofiling/',
  '/knowyourvaluesahimsanon-violenceprofiling/',
  '/knowyourvaluessatyatruthfulnessprofiling/',
  '/knowyourvaluesasteyanonstealingprofiling/',
  '/knowyourvaluesbrahmacharya-profiling/',
  '/atman/',
  '/jiva/',
  '/jagat/',
  '/anubandha-chatushtaya/',
  '/karmayoga-scale/',
  '/teertha-yatra-quiz/',
]

/** The category archives, and the author archives as a pattern: never a username. */
export const oldArchives: readonly string[] = [
  '/category/concepts/',
  '/category/uncategorized/',
  '/author/:name*/',
]

/** The old site's one named feed, the front page's. */
export const oldFeed = '/feed/'

/** The feed an old page or archive served under its own address; the front page's is oldFeed. */
export function feedOf(address: string): string {
  return address === '/' ? oldFeed : `${address}feed/`
}

/** An uploaded file's address, with the pages that showed it, in this inventory's order. */
export interface OldMedia {
  address: string
  shownOn: readonly string[]
}

/**
 * The 52 addresses under /wp-content/uploads/ that the pages and posts showed, sizes and
 * thumbnails included. They are 12 of the 71 uploaded files FR-07 counts: the saved copies hold
 * no media library, so the rest are not known here.
 */
export const oldMedia: readonly OldMedia[] = [
  {
    address: '/wp-content/uploads/2023/09/Karma-Yoga-1024x705.png',
    shownOn: ['/', '/home/', '/home-2/'],
  },
  {
    address: '/wp-content/uploads/2023/09/Karma-Yoga-300x207.png',
    shownOn: ['/', '/home/', '/home-2/'],
  },
  {
    address: '/wp-content/uploads/2023/09/Karma-Yoga-768x529.png',
    shownOn: ['/', '/home/', '/home-2/'],
  },
  { address: '/wp-content/uploads/2023/09/Karma-Yoga.png', shownOn: ['/', '/home/', '/home-2/'] },
  { address: '/wp-content/uploads/2023/09/Triguna-Scale-150x150.png', shownOn: ['/home/'] },
  { address: '/wp-content/uploads/2023/09/Triguna-Scale-300x300.png', shownOn: ['/home/'] },
  { address: '/wp-content/uploads/2023/09/Triguna-Scale.png', shownOn: ['/home/'] },
  {
    address: '/wp-content/uploads/2023/09/elementor/thumbs/Triguna-Scale-150x150.png',
    shownOn: ['/home/'],
  },
  { address: '/wp-content/uploads/2023/11/atman-and-brahman-300x207.jpg', shownOn: ['/home-2/'] },
  { address: '/wp-content/uploads/2023/11/atman-and-brahman.jpg', shownOn: ['/home-2/'] },
  {
    address: '/wp-content/uploads/2024/05/Book-icon-2-218x300.png',
    shownOn: ['/', '/home/', '/home-2/'],
  },
  { address: '/wp-content/uploads/2024/05/Book-icon-2.png', shownOn: ['/', '/home/', '/home-2/'] },
  {
    address: '/wp-content/uploads/2024/05/Cosmos-icon-150x150.png',
    shownOn: ['/', '/home/', '/home-2/'],
  },
  {
    address: '/wp-content/uploads/2024/05/Cosmos-icon-300x300.png',
    shownOn: ['/', '/home/', '/home-2/'],
  },
  {
    address: '/wp-content/uploads/2024/05/Cosmos-icon-768x768.png',
    shownOn: ['/', '/home/', '/home-2/'],
  },
  { address: '/wp-content/uploads/2024/05/Cosmos-icon.png', shownOn: ['/', '/home/', '/home-2/'] },
  {
    address: '/wp-content/uploads/2024/05/Gear-Icon-150x150.png',
    shownOn: ['/', '/home/', '/home-2/'],
  },
  {
    address: '/wp-content/uploads/2024/05/Gear-Icon-300x297.png',
    shownOn: ['/', '/home/', '/home-2/'],
  },
  {
    address: '/wp-content/uploads/2024/05/Gear-Icon-768x761.png',
    shownOn: ['/', '/home/', '/home-2/'],
  },
  { address: '/wp-content/uploads/2024/05/Gear-Icon.png', shownOn: ['/', '/home/', '/home-2/'] },
  { address: '/wp-content/uploads/2024/05/Karmayoga-Main-image-150x150.jpeg', shownOn: ['/home/'] },
  { address: '/wp-content/uploads/2024/05/Karmayoga-Main-image-300x300.jpeg', shownOn: ['/home/'] },
  { address: '/wp-content/uploads/2024/05/Karmayoga-Main-image-768x768.jpeg', shownOn: ['/home/'] },
  { address: '/wp-content/uploads/2024/05/Karmayoga-Main-image.jpeg', shownOn: ['/home/'] },
  {
    address: '/wp-content/uploads/2024/05/Psychology-Techniques-icon-4-150x150.png',
    shownOn: ['/', '/home-2/'],
  },
  {
    address: '/wp-content/uploads/2024/05/Psychology-Techniques-icon-4-300x278.png',
    shownOn: ['/home/'],
  },
  {
    address: '/wp-content/uploads/2024/05/Psychology-Techniques-icon-4-768x713.png',
    shownOn: ['/home/'],
  },
  { address: '/wp-content/uploads/2024/05/Psychology-Techniques-icon-4.png', shownOn: ['/home/'] },
  { address: '/wp-content/uploads/2024/05/Sculptor-3-150x150.jpeg', shownOn: ['/home/'] },
  { address: '/wp-content/uploads/2024/05/Sculptor-3-300x300.jpeg', shownOn: ['/home/'] },
  { address: '/wp-content/uploads/2024/05/Sculptor-3-768x768.jpeg', shownOn: ['/home/'] },
  { address: '/wp-content/uploads/2024/05/Sculptor-3.jpeg', shownOn: ['/home/'] },
  { address: '/wp-content/uploads/2024/05/Spiritual-Climate-150x150.jpeg', shownOn: ['/home/'] },
  { address: '/wp-content/uploads/2024/05/Spiritual-Climate-300x300.jpeg', shownOn: ['/home/'] },
  { address: '/wp-content/uploads/2024/05/Spiritual-Climate-768x768.jpeg', shownOn: ['/home/'] },
  { address: '/wp-content/uploads/2024/05/Spiritual-Climate.jpeg', shownOn: ['/home/'] },
  {
    address: '/wp-content/uploads/2024/05/Survey-1-e1715701729946.png',
    shownOn: ['/', '/home/', '/home-2/'],
  },
  {
    address: '/wp-content/uploads/2024/05/elementor/thumbs/Karmayoga-Main-image-150x150.jpeg',
    shownOn: ['/home/'],
  },
  {
    address:
      '/wp-content/uploads/2024/05/elementor/thumbs/Karmayoga-Main-image-qo59eispz4twwxmn55tonqvlcp7uj1yr0lutq8vkaw.jpeg',
    shownOn: ['/home/'],
  },
  {
    address: '/wp-content/uploads/2024/05/elementor/thumbs/Spiritual-Climate-150x150.jpeg',
    shownOn: ['/home/'],
  },
  {
    address:
      '/wp-content/uploads/2025/03/brahma-madurai-meenakshi-amman-temple-1576032-1024x821-1-300x241.jpg',
    shownOn: ['/concepts/'],
  },
  {
    address:
      '/wp-content/uploads/2025/03/brahma-madurai-meenakshi-amman-temple-1576032-1024x821-1-768x616.jpg',
    shownOn: ['/concepts/'],
  },
  {
    address:
      '/wp-content/uploads/2025/03/brahma-madurai-meenakshi-amman-temple-1576032-1024x821-1.jpg',
    shownOn: ['/concepts/'],
  },
  {
    address:
      '/wp-content/uploads/elementor/thumbs/52688095545_b9fa332de6_c-qepk82df3v1ko7kmqlxlp7eichst6sbb13p9q9eg0o.jpg',
    shownOn: ['/'],
  },
  {
    address:
      '/wp-content/uploads/elementor/thumbs/Indian-Farmer-qnpo5vd6t06qgw0f4390stijv9dc23wgsvbsngii6g.jpeg',
    shownOn: ['/', '/home-2/'],
  },
  {
    address:
      '/wp-content/uploads/elementor/thumbs/Jewellry-making-2-qnpn6ncwphyxex69sd5av7hqigz6mf2kaj9s96qlc8.jpeg',
    shownOn: ['/', '/home-2/'],
  },
  {
    address:
      '/wp-content/uploads/elementor/thumbs/Karmayoga-Main-image-qo59eit25oq90z7zaahdsjb7q3c54m3xujqj89nsm0.jpeg',
    shownOn: ['/', '/home-2/'],
  },
  {
    address:
      '/wp-content/uploads/elementor/thumbs/Sculptor-3-qnpnpjw25juiwlprejb70frglfsxfa4883lbpipk7c.jpeg',
    shownOn: ['/', '/home-2/'],
  },
  {
    address:
      '/wp-content/uploads/elementor/thumbs/WhatsApp-Image-2023-08-03-at-3.13.15-PM-qcoafukgqxnyv2l3pj6x632wqgmdxau37o1vcnv060.png',
    shownOn: ['/'],
  },
  {
    address:
      '/wp-content/uploads/elementor/thumbs/Work-on-the-brain-1-qnpo4hk2xc6vhlm4c4dhrgiqr8b6bpjvrymrptclnc.jpeg',
    shownOn: ['/', '/home-2/'],
  },
  {
    address:
      '/wp-content/uploads/elementor/thumbs/atman-and-brahman-qffrg0eg02682go1v94erjhb959nq529jfe1q2kza0.jpg',
    shownOn: ['/'],
  },
  {
    address:
      '/wp-content/uploads/elementor/thumbs/human-mind-and-sage-2-qnpn5u8906rdj1xxnn7kcpa2gx33ld02ogxfvmq108.jpeg',
    shownOn: ['/', '/home-2/'],
  },
]

/** A post's WordPress id, which `/?p=<id>` answered with that post. */
export interface OldShortlink {
  id: string
  post: string
}

/** The six posts' shortlinks. */
export const oldShortlinks: readonly OldShortlink[] = [
  { id: '431', post: '/karmayoga-scale/' },
  { id: '353', post: '/anubandha-chatushtaya/' },
  { id: '329', post: '/teertha-yatra-quiz/' },
  { id: '300', post: '/jagat/' },
  { id: '298', post: '/jiva/' },
  { id: '296', post: '/atman/' },
]

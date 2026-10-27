/** Every page the site serves, and a URL that must 404. Extend this list whenever a page is added. */
export const PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/concepts/vikshepa', name: 'Concept page' },
  { path: '/questionnaires/karmayoga-scale', name: 'Questionnaire page' },
] as const

export const MISSING = '/this-page-does-not-exist'

/** What the login screens and the auth route both need to agree on: no secrets, safe in a browser bundle. */

/** The action the Turnstile widget stamps on a token and the server insists on. */
export const BOT_CHECK_ACTION = 'login'

/** The screen a request to send an emailed code came from, named by the screen itself. */
export const LOGIN_INTENT_HEADER = 'x-login-intent'

/** Set beside the user-session cookie, which pages can't read, so a page can tell a logged-out browser without a request. */
export const SESSION_HINT_COOKIE = 'c4m-logged-in'

/** The Privacy page's address, where a Delete my account link lands. */
export const PRIVACY_PATH = '/privacy/'

/** On the Privacy page's address, the token an emailed Delete my account link carries. */
export const DELETE_ACCOUNT_PARAM = 'delete-account'

/** The auth route's address, with the trailing slash every address on the site has. */
export const authAddress = (path: string) => `/api/auth${path}/`

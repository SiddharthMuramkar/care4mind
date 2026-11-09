/** Apps that open links in a browser of their own, named by what they add to the user agent. */
const APP_BROWSER =
  /FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|MicroMessenger|WhatsApp|Line\/|Snapchat|TikTok|BytedanceWebview|musical_ly|GSA\/|; wv\)/

/** On an iPhone or iPad a web view leaves out `Safari`, which every full browser there says. */
const IOS_WEB_VIEW = /\b(?:iPhone|iPad|iPod)\b(?!.*\bSafari\b)/

/** Whether a user agent is a browser inside another app, where Google refuses to sign anyone in. */
export function isInAppBrowser(userAgent: string): boolean {
  return APP_BROWSER.test(userAgent) || IOS_WEB_VIEW.test(userAgent)
}

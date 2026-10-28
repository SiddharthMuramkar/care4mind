import { siteIndex } from '@/lib/search/server'

// Built once with the site (design A4); the browser fetches it only when someone is about to search.
export const dynamic = 'force-static'

export async function GET() {
  return Response.json(await siteIndex())
}

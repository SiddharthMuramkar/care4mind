---
status: accepted
---

# Keep the client's folk art as it is

The new site brings over the client's own Emblem, Stickers and Plates and shows them as they are, never recoloured or put under a duotone, because the client's colours are the point. This gives up one uniform treatment across the site, and with it the duotone's calm. It reverses the earlier plan in the later-phases list, which gave every picture the same duotone.

The pictures are stable files under `public/art/`, served through `next/image`. A file there never changes in place, and a new version gets a new name, which is what makes the 31-day image cache safe. Every picture has a record in the art registry, `src/art/`, holding its origin, licence, alt text and approval. New pictures are made with Recraft's official MCP server, on the Basic plan with Pay monthly (about US$12), for one month on the developer's own account, and the rights pass to the client at handover. They stay behind the `draftArt` flag until the client approves them.

## Considered options

- **One duotone over everything** (the earlier plan). It would be calmer and give the site one look, but it removes what the client likes.
- **Stock pictures from open collections in that duotone** (The Met Open Access, Unsplash, Pexels, Wikimedia Commons, Open Peeps, unDraw). Each has its own licence terms, and none is the client's visual language.
- **Prompts pasted by hand into ChatGPT or Gemini** instead of Recraft. Neither route learns a reusable style from the client's Stickers.
- **Commit all 71 old files.** That is about 36 MB against about 16 MB for the 22 kept pictures, and most would never be used. The full export is zipped and handed to the client instead.

## Consequences

- The 22 kept pictures go in before the client confirms the right to reuse them. That answer blocks launch, and is tracked in [#25](https://github.com/SiddharthMuramkar/care4mind/issues/25).
- Pictures vary in palette next to Press's indigo and paper. They sit on the paper as tipped-in Plates and Stickers, and Press itself does not change.
- No origin, licence or credit text sits beside a picture. `/credits/` shows captions only, and `/credits/sources/` is the plain list built from the registry.
- The Plates are 1024 x 1024 and most Stickers are smaller, which caps how large they can show sharply. [#25](https://github.com/SiddharthMuramkar/care4mind/issues/25) asks the client for larger ones.

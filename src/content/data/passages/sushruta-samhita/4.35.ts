import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'sushruta-samhita/4.35',
  work: 'sushruta-samhita',
  locator: '4.35',
  order: [4, 35],
  devanagari: [
    'निद्राहेतुस्तमः सत्त्वं बोधने हेतुरुच्यते ।',
    'स्वभाव एव वा हेतुर्गरीयान् परिकीर्त्यते',
  ],
  transliteration: {
    lines: [
      'Nidrāhetustamaḥ, sattvaṃ bodhane heturucyate |',
      'Svabhāva eva vā heturgarīyān parikīrtyate',
    ],
    scheme: 'iast',
  },
  translations: [],
  provenance: {
    sources: [{ url: 'https://care4mind.org/triguna/', retrieved: '2026-10-27' }],
    edits: [
      'The page numbers this verse “Sush Samh 4.35”, and its Online Resources line names “Sushruta Samhita (Sharirasthanam Adhyayam 4 Sutram 35)”; the locator is the page’s 4.35.',
      'The verse mark and the short citation after the last line are left out, since the work and locator hold them: “ ॥ (Sush Samh 4.35)” → “” and “ || (Sush Samh 4.35)” → “”.',
      'A Devanagari line holds Devanagari only, so the comma after the first word is left out: “निद्राहेतुस्तमः, सत्त्वं” → “निद्राहेतुस्तमः सत्त्वं”.',
      'Anusvara written with a dot above (U+1E41) normalised to ṃ, as in sattvaṃ.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Triguna page gives no translation of this verse and no “Meaning”; none is stored, and none was looked up.',
        decidedBy: 'traditional-texts',
      },
      {
        for: 'research-editor',
        note: 'The page numbers this verse “Sush Samh 4.35” and names it “Sushruta Samhita (Sharirasthanam Adhyayam 4 Sutram 35)” in its Online Resources; the locator 4.35 doesn’t name the section (sthāna). Confirm how the site should number it.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})

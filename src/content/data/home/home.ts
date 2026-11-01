import { defineHome } from '@/content/schema'

export default defineHome({
  kind: 'home',
  tagline: 'Indian ideas for a balanced mind, explained simply.',
  shloka: {
    devanagari: 'यद् भावं तद् भवति',
    iast: 'yad bhāvaṃ tad bhavati',
    translation: 'As are the thoughts, so are the manifestations.',
  },
  hero: {
    promise: 'Indian psychology, explained simply.',
    subhead:
      'Ideas about the mind from India’s traditional texts, such as distraction, anger, values and staying steady, explained in plain English, with the References behind them.',
    startHere: 'Start here',
    browseConcepts: 'Browse concepts',
    exploreConcepts: 'Explore concepts',
  },
  sectionIntros: {
    concepts: 'Each Concept is a single idea from Indian psychology, named by its Sanskrit term.',
    questionnaires:
      'A Questionnaire gives you a result from documented scoring rules. Each one sets out its purpose and limitations before you start.',
  },
  intro:
    'The Bharatiya way of philosophic analysis starts with the reflection on the inner Self of man with the ultimate goal, of all mental training, being attainment of Moksha.',
  // Each area leads where its current-site link went (ticket 07); Applications led to the dead
  // questionnaire app, so it has no target until the Project owner gives it one.
  areas: [
    {
      title: 'Concepts',
      text: 'Explore the rich spiritual traditions of India to understand the unique concepts of ancient Indian psychology.',
      target: { index: 'concepts' },
    },
    {
      title: 'Techniques',
      text: 'Emerging cross-cultural techniques in recent times armed the toolbox of caregivers in many ways.',
      target: { kind: 'page', id: 'methods' },
    },
    {
      title: 'Resources',
      text: 'Our self is our most important resource. An array of inward journey resources help us find ways to mentor the mind.',
      target: { index: 'library' },
    },
    {
      title: 'Tradition and Texts',
      text: 'Ancient Indian philosophical texts that deal with specific perspectives of each unique concept.',
      target: { kind: 'resource-list', id: 'textbooks' },
    },
    {
      title: 'Applications',
      text: 'Reflect on applying knowledge of ancient Indian psychology in contemporary situations.',
    },
    {
      title: 'Research',
      text: 'Opportunities in Indian psychology research to create and host models related to Indian theories.',
      target: { kind: 'resource-list', id: 'courses' },
    },
  ],
  closing: 'Open the doors to your inner potential.',
  helpLine:
    'Care4Mind is for learning and reflection, not treatment. To talk to someone now, call Tele-MANAS on 14416 or 1-800-891-4416 (free, 24×7, in about 20 languages). In an emergency, call 112. Outside India, call your local emergency number.',
  provenance: {
    sources: [
      { url: 'https://care4mind.org/', retrieved: '2026-10-27' },
      { url: 'https://telemanas.mohfw.gov.in/', retrieved: '2026-11-01' },
    ],
    edits: [
      // The front-end foundation's edits (planning ticket 21), kept as it wrote them.
      'Ellipsis and spacing tidied in the shloka’s English line and the area texts; “Ancient Indian Psychology” lower-cased mid-sentence; stray “,and” fixed.',
      'Closing line “Open the doors to your inner potential !!!” ends with a full stop.',
      'Left out: the four placeholder “Questionaire” cards, which repeat one text, and the survey placeholders.',
      // Listed when the record was re-homed into content v1.
      'Shloka translation: “thoughts…so” → “thoughts, so”.',
      'sectionIntros: the two section intros the homepage had hard-coded, moved here word for word.',
      'Concepts area: “unique concepts of Ancient Indian Psychology” → “unique concepts of ancient Indian psychology.”.',
      'Resources area: “to mentor the mind” → “to mentor the mind.”.',
      'Research area: “create ,and host” → “create and host”.',
      'Closing line: “potential !!!” → “potential.”.',
      'Interface text dropped: each area’s link label (“Concepts...”, “Methods...”, “Resources...”, “Persepctives...”, “Applications...”, “Opportunities...”) and the “-” under each area’s text.',
      'Left out: the “Psychology” heading above the areas, the “Karma Yoga: An Indian Perspective of Work” heading, and the closing “Ancient Indian Wisdom” link to DharmaWiki’s main page.',
      // Listed when ticket 07 set the area targets.
      'Area links set for the new site (D11): Concepts leads to the Concepts index (it linked /concepts/), Techniques to Methods (it linked /methods/), Resources to the Library home (it linked /resources/, an empty page), Tradition and Texts to Text Books (it linked /text-books-2-2/, merged into Text Books) and Research to Courses (it linked /institutes/, now Courses). Applications linked to the current site’s questionnaire app, which no longer works, and has no link.',
      // Listed by the fidelity sweep (ticket 12): the headings of the cards left out above.
      'Headings left out with their cards, as the page writes them: “Questionnaires & Surveys” over all of them; “Questionaire”, “Questionaire -02” (twice) and “Questionaire - 03”, whose “Click to begin....” links go to the questionnaire app; and “Dosha”, “Survey -02”, “survey -03” and “Survey -04”, whose “Survey...” links go to the Dosha Survey page. The Dosha card’s description is quoted in a flag on the Dosha Survey.',
    ],
    flags: [
      {
        for: 'project-owner',
        note: 'The homepage’s Applications area linked to the current site’s questionnaire app, which no longer works, so it has no link on the new site. Choose a destination for it, or drop the area.',
        ticket: 19,
      },
      {
        for: 'project-owner',
        note: 'The homepage’s Tradition and Texts area linked to /text-books-2-2/, a reading list, so it now leads to Text Books, where that page went. Its text is about ancient Indian philosophical texts, which the new Texts index (/texts/) may suit better. Confirm, or choose another destination.',
        ticket: 20,
      },
      {
        for: 'project-owner',
        note: 'The homepage’s Research area linked to /institutes/, so it now leads to Courses, where that page went. Its text is about opportunities in Indian psychology research, which no page of the new site covers as such. Confirm, or choose another destination.',
        ticket: 20,
      },
    ],
    drafted: ['tagline', 'hero', 'helpLine'],
  },
})

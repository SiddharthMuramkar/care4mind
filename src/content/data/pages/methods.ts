import { definePage } from '@/content/schema'

// /methods/, kept as a page of the Library (D11, D13): its heading and first paragraph, then its
// four tabs as sections, the first two holding the page's two tables.
export default definePage({
  kind: 'page',
  slug: 'methods',
  title: 'Therapy approaches',
  summary:
    'Psychotherapy, also known as talk therapy, involves various techniques to help individuals enhance their mental and emotional well-being.',
  sections: [
    {
      id: 'therapeutic-methods-in-mental-treatment',
      heading: 'Therapeutic Methods in Mental Treatment',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Psychotherapy focuses on addressing thought patterns, emotions, and behaviors that may cause distress or disrupt daily life.',
        },
      ],
    },
    {
      id: 'psychoanalysis-psychodynamic-therapy',
      heading: 'Psychoanalysis / Psychodynamic Therapy',
      blocks: [
        {
          kind: 'table',
          id: 'approaches',
          caption: 'Five approaches to psychotherapy',
          columns: ['Approach', 'Description'],
          rows: [
            {
              head: 'Psychoanalysis/Psychodynamic Therapy',
              cells: [
                'Explores unconscious processes, past experiences, and their impact on present behavior, focusing on building self-awareness and insight.',
              ],
            },
            {
              head: 'Behavior Therapy',
              cells: [
                'Focuses on identifying and modifying maladaptive behaviors through techniques like exposure therapy, systematic desensitization, and operant conditioning.',
              ],
            },
            {
              head: 'Cognitive Therapy',
              cells: [
                'Helps individuals identify and challenge negative thought patterns and beliefs that contribute to emotional distress, aiming to promote more realistic and adaptive thinking.',
              ],
            },
            {
              head: 'Humanistic Therapy',
              cells: [
                'Emphasizes the individual’s inherent potential for growth and self-actualization, focusing on empathy, unconditional positive regard, and the client’s subjective experience.',
              ],
            },
            {
              head: 'Integrative/Holistic Therapy',
              cells: [
                'Combines elements from different therapeutic approaches to tailor treatment to the individual’s specific needs and goals.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'specific-types-of-psychotherapy',
      heading: 'Specific Types of Psychotherapy',
      blocks: [
        {
          kind: 'table',
          id: 'therapy-types',
          caption: 'Specific Types of Psychotherapy',
          columns: ['Therapy Type', 'Description'],
          rows: [
            {
              head: 'Cognitive Behavioral Therapy (CBT)',
              cells: [
                'A popular approach that combines cognitive and behavioral techniques to address thought patterns, feelings, and behaviors.',
              ],
            },
            {
              head: 'Dialectical Behavior Therapy (DBT)',
              cells: [
                'A method developed to help individuals with borderline personality disorder, focusing on emotional regulation, distress tolerance, and interpersonal effectiveness.',
              ],
            },
            {
              head: 'Interpersonal Therapy (IPT)',
              cells: [
                'Focuses on improving interpersonal relationships and communication skills to address challenges in social interactions.',
              ],
            },
            {
              head: 'Family Therapy',
              cells: [
                'Addresses family dynamics and communication patterns to improve relationships and resolve conflicts.',
              ],
            },
            {
              head: 'Group Therapy',
              cells: [
                'A format where individuals share experiences and receive support from a group setting, often led by a therapist.',
              ],
            },
            {
              head: 'Eye Movement Desensitization and Reprocessing (EMDR)',
              cells: [
                'A technique used to process traumatic memories by combining mental processing with bilateral stimulation, such as eye movements.',
              ],
            },
            {
              head: 'Acceptance and Commitment Therapy (ACT)',
              cells: [
                'Focuses on accepting difficult feelings and thoughts while committing to values-driven actions.',
              ],
            },
            {
              head: 'Gestalt Therapy',
              cells: [
                'A humanistic approach that emphasizes awareness of the present moment and encourages clients to explore their feelings and experiences.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'delivery-formats',
      heading: 'Delivery Formats',
      blocks: [
        {
          kind: 'list',
          style: 'bullet',
          items: [
            'Individual Therapy: Working one-on-one with a therapist.',
            'Couples Therapy: Addressing relationship issues with a therapist.',
            'Family Therapy: Addressing family dynamics with a therapist.',
            'Group Therapy: Working with a group of individuals who share similar issues.',
            'Teletherapy: Utilizing technology for online or phone-based therapy.',
          ],
        },
      ],
    },
    {
      id: 'key-elements-of-effective-psychotherapy',
      heading: 'Key Elements of Effective Psychotherapy',
      blocks: [
        {
          kind: 'list',
          style: 'bullet',
          items: [
            'Establishing a Strong Therapeutic Alliance: Building a trusting and collaborative relationship between the therapist and the client.',
            'Honesty and Transparency: Openly sharing thoughts and feelings with the therapist.',
            'Engagement and Participation: Actively contributing to therapy sessions and working towards personal goals.',
            'Consistent Attendance: Maintaining regular session attendance to sustain progress.',
            'Commitment to Progress: Dedicating time and effort to overcoming challenges and implementing positive changes.',
          ],
        },
      ],
    },
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/methods/', retrieved: '2026-10-27' }],
    edits: [
      'Renamed: the page is titled “Therapy approaches”, not “Methods”. Its address is unchanged.',
      'Fixed: the first section’s paragraph opened with the page’s first paragraph again, word for word (“Psychotherapy, also known as talk therapy, involves various techniques to help individuals enhance their mental and emotional well-being.”). The repeat is dropped, and the next sentence’s “It focuses on” reads “Psychotherapy focuses on”.',
      'Fixed: the first table’s caption, taken from its section’s heading, named only the first of the five approaches it lists. It reads “Five approaches to psychotherapy”.',
      'Each of the page’s four tabs is a section, headed by the tab’s title.',
      'The two tables have no caption on the page, so the second takes the heading above it, its tab’s title: “Specific Types of Psychotherapy”.',
      'Left out: the emoji after each delivery format’s name (U+1F464, U+1F491, the family sequence U+1F468 U+200D U+1F469 U+200D U+1F467, U+1F465 and U+1F310), which the site’s fonts don’t cover. The items read: “Individual Therapy: Working one-on-one with a therapist.”, “Couples Therapy: Addressing relationship issues with a therapist.”, “Family Therapy: Addressing family dynamics with a therapist.”, “Group Therapy: Working with a group of individuals who share similar issues.” and “Teletherapy: Utilizing technology for online or phone-based therapy.”',
      'Each delivery format and key element is one list item, its name and its description joined: the page sets them on two lines.',
      'The list of key elements, which the page nests inside an otherwise empty list item, is one list.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The first tab on /methods/ is titled “Psychoanalysis / Psychodynamic Therapy”, but its table lists five approaches, of which that is only the first. The heading is kept as the page has it; confirm or correct it. The table’s caption no longer repeats it.',
      },
    ],
  },
})

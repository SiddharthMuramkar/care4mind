import { defineResourceList } from '@/content/schema'

// /institutes/, titled "Courses", with the IGNOU and NIOS courses of the two Text Books pages
// merged in (D11). Courses aren't References: each keeps its provider, name, description and
// link as the pages give them.
export default defineResourceList({
  kind: 'resource-list',
  slug: 'courses',
  title: 'Courses',
  groups: [
    {
      id: 'top-universities-for-psychology',
      heading: 'Top Universities for Psychology',
      items: [
        {
          type: 'course',
          provider: 'MIT School of Vedic Sciences, Pune, Maharashtra',
          name: 'B.Sc in Integral Psychology',
          description:
            'This 3-year course offers contemporary education in Psychology with additional proficiency in Vedic/Yoga psychology.',
          url: 'https://www.mitwpu.edu.in/program/bsc-integral-psychology',
        },
        {
          type: 'course',
          provider: 'Fatima Mata National College, Kollam, Kerala',
          name: 'B.Sc in Psychology',
          description:
            'This college offers Indian Psychology as an elective paper at the undergraduate level.',
          url: 'https://fmnc.ac.in/department-of-psychology/',
        },
        {
          type: 'course',
          provider: 'Delhi University',
          name: 'Department of Psychology',
          description:
            'The Department of Psychology at Delhi University consistently ranks among the best in the country.',
          url: 'https://psychology.du.ac.in/',
        },
        {
          type: 'course',
          provider: 'Banaras Hindu University',
          name: 'MA Psychology',
          description:
            'BHU offers a highly reputable MA Psychology program with a focus on practical application and research.',
          url: 'https://www.bhu.ac.in/Site/UnitList/1_9_10',
        },
        {
          type: 'course',
          provider: 'KIIT University, Bhubaneshwar',
          name: 'Department of Psychology',
          description:
            'With state-of-the-art facilities and experienced faculty, KIIT University’s Department of Psychology provides a comprehensive learning experience.',
          url: 'https://ksrm.ac.in/programs/ma-in-applied-psychology/',
        },
      ],
    },
    {
      id: 'psychology-courses',
      heading: 'Psychology Courses',
      items: [
        {
          type: 'course',
          provider: 'IGNOU',
          name: 'B.A. in Psychology (UG)',
          description:
            'Offered by the Indira Gandhi National Open University, this undergraduate program covers the foundations of psychology.',
          url: 'https://www.ignou.ac.in/ignou/aboutignou/school/soss/programmes',
        },
        {
          type: 'course',
          provider: 'IGNOU',
          name: 'M.A. in Psychology (PG)',
          description:
            'A postgraduate course focused on psychological theories, mental health, and research.',
          url: 'https://www.ignou.ac.in/schools/programme/MAPC',
        },
        {
          type: 'course',
          provider: 'NIOS',
          name: 'Secondary Level Psychology',
          description:
            'A secondary-level psychology course by the National Institute of Open Schooling.',
          url: 'https://nios.ac.in/online-course-material/secondary-courses/psychology-%28222%29-syllabus.aspx',
        },
      ],
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/institutes/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/text-books/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/text-books-2-2/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Merged (D11): IGNOU’s two courses and NIOS’s one, which both Text Books pages list under “Psychology Courses”, each kept once, with the name and description /text-books/ gives it and the link both pages give.',
      'Each course heading on /text-books/ is split at its dash into provider and name: “IGNOU – B.A. in Psychology (UG)”, “IGNOU – M.A. in Psychology (PG)” and “NIOS – Secondary Level Psychology”.',
      'Delhi University, Banaras Hindu University and KIIT University name no course on /institutes/, so each one’s name is taken from its own description: “Department of Psychology”, “MA Psychology” and “Department of Psychology”.',
      'Interface text dropped: the link labels “Course Details” and “Department Website”, and on /text-books-2-2/ “UG Psychology”, “PG Psychology” and “Learn More”. Each link is its course’s URL.',
      'Left out (D18): the 5 images on /institutes/, and the 3 beside the courses on /text-books/.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The “Course Details” link of KIIT University, Bhubaneshwar, on /institutes/ goes to ksrm.ac.in, an address that doesn’t name the university, at a page whose address names an MA in applied psychology. Kept as the page gives it; confirm it is the course meant. Nothing was looked up or opened.',
      },
      {
        for: 'research-editor',
        note: 'Delhi University, Banaras Hindu University and KIIT University name no course on /institutes/. Their names on Courses (“Department of Psychology”, “MA Psychology” and “Department of Psychology”) are taken from their own descriptions; confirm or correct them. Nothing was looked up.',
      },
    ],
  },
})

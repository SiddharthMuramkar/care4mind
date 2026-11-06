import type { SectionView } from '@/content'

/** A role a section can carry: its applications, or an "Indian vs Western" comparison. */
export type SectionRole = NonNullable<SectionView['role']>

/** How a section's role is named, wherever a section is named. */
export const SECTION_ROLES: Readonly<Record<SectionRole, string>> = {
  applications: 'Applications',
  comparison: 'Comparison',
}

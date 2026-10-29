import { Text } from '@/components/prose'
import type { ResourceItemView, ResourceListView } from '@/content'

import { siteOf } from './catalogue'
import styles from './courses.module.css'
import { AwayLink } from './SourceLink'

type Course = Extract<ResourceItemView, { type: 'course' }>

/** A course as a card: who offers it, its name, what it is, and its page on the provider's site. */
function CourseCard({ course }: { course: Course }) {
  return (
    <li className={styles.card}>
      <p className={styles.provider}>{course.provider}</p>
      <h3 className={styles.name}>{course.name}</h3>
      {course.description ? (
        <p className={styles.description}>
          <Text text={course.description} />
        </p>
      ) : null}
      {course.url ? (
        <p className={styles.visit}>
          <AwayLink href={course.url} label={`Visit ${siteOf(course.url)}`} />
        </p>
      ) : null}
    </li>
  )
}

/** A group of courses, as the list heads it, with a card for each. */
export function CourseGroup({ group }: { group: ResourceListView['groups'][number] }) {
  return (
    <section id={group.id} className={styles.group} aria-labelledby={`${group.id}-title`}>
      <h2 id={`${group.id}-title`} className={styles.groupTitle}>
        {group.heading}
      </h2>
      <ul className={styles.cards}>
        {group.items.map((item) =>
          item.type === 'course' ? (
            <CourseCard key={`${item.provider}/${item.name}`} course={item} />
          ) : null,
        )}
      </ul>
    </section>
  )
}

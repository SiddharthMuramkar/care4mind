import { Text } from '@/components/prose'
import type { ResourceItemView, ResourceListView } from '@/content'

import { siteOf } from './catalogue'
import styles from './courses.module.css'
import { AwayLink } from './SourceLink'

type Course = Extract<ResourceItemView, { type: 'course' }>

/**
 * A course as a card: its name, the institution that offers it and where, what it is, and its
 * page on the institution's site. Its name heads it as an h3 under its group's heading, or as
 * an h2 where the group is the list's only one and the page's title heads it.
 */
function CourseCard({ course, headed }: { course: Course; headed: boolean }) {
  const Name = headed ? 'h3' : 'h2'
  return (
    <li className={styles.card}>
      <Name className={styles.name}>{course.name}</Name>
      <p className={styles.provider}>
        {course.provider}
        {course.city ? <span className={styles.city}>{course.city}</span> : null}
      </p>
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

/** A group of courses, as the list heads it (unless it is the list's only one), with a card for each. */
export function CourseGroup({
  group,
  headed,
}: {
  group: ResourceListView['groups'][number]
  headed: boolean
}) {
  return (
    <section
      id={group.id}
      className={styles.group}
      aria-labelledby={headed ? `${group.id}-title` : 'page-title'}
    >
      {headed ? (
        <h2 id={`${group.id}-title`} className={styles.groupTitle}>
          {group.heading}
        </h2>
      ) : null}
      <ul className={styles.cards}>
        {group.items.map((item) =>
          item.type === 'course' ? (
            <CourseCard key={`${item.provider}/${item.name}`} course={item} headed={headed} />
          ) : null,
        )}
      </ul>
    </section>
  )
}

import Image from 'next/image'

import { EMBLEM_MARK, EMBLEM_RING } from '@/art/emblem'

const RECORDS = { ring: EMBLEM_RING, mark: EMBLEM_MARK }

/**
 * The Care4Mind Emblem: `ring` is the lotus in its ring of leaves, `mark` the lotus alone.
 * Decorative unless it stands for the organisation by itself. It reads the plain Emblem records
 * rather than the registry, because the error pages are client components. With `firstScreen`,
 * at the head of a page, it loads at once, ahead of the rest.
 */
export function Emblem({
  variant,
  size,
  decorative = true,
  firstScreen = false,
  className,
}: {
  variant: keyof typeof RECORDS
  size: number
  decorative?: boolean
  firstScreen?: boolean
  className?: string
}) {
  const record = RECORDS[variant]
  return (
    <Image
      src={record.src}
      width={size}
      height={Math.round((size * record.height) / record.width)}
      alt={decorative ? '' : record.alt}
      loading={firstScreen ? 'eager' : undefined}
      fetchPriority={firstScreen ? 'high' : undefined}
      className={className}
    />
  )
}

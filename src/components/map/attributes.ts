/**
 * The map's data attributes: the plate and the list write them, the lit rules and the filters read
 * them. ConceptMap.module.css spells them out again, since CSS can't import names.
 */
export const mapAttribute = {
  /** The map's root, the anchor of every lit rule. */
  map: 'data-map',
  /** A Concept on the plate, by its slug. */
  point: 'data-p',
  /** A Concept's neighbours still shown, as slugs. */
  near: 'data-near',
  /** A curve and its row in the list, by the same id. */
  connection: 'data-c',
  /** A connection's two Concepts, as slugs. */
  ends: 'data-ends',
  kind: 'data-kind',
  topics: 'data-topics',
  /** A part of the list, one per kind of connection. */
  kindSection: 'data-kind-section',
  /** A curve a filter takes off the plate. */
  off: 'data-off',
  /** A Concept outside the chosen topics, in a lighter ink. */
  faint: 'data-faint',
  /** A filter's chip, as `kind:<kind>` or `topic:<slug>`. */
  chip: 'data-chip',
} as const

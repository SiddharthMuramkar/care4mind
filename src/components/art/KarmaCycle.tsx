import { Fragment, useId } from 'react'

import {
  CYCLE_CENTRE,
  CYCLE_DESCRIPTION,
  CYCLE_LOKASAMGRAHA,
  CYCLE_NODES,
  CYCLE_STEPS,
  CYCLE_TITLE,
  type CycleArrow,
  type CycleNode,
  headOf,
  type Line,
  pathOf,
  type Point,
  type Run,
} from './karma-cycle'
import styles from './KarmaCycle.module.css'

/** A line of a stacked label, and the strike's height over its baseline, both in em. */
const LEADING = 1.2
const STRIKE_LIFT = 0.3

const RunText = ({ run, Tag }: { run: Run; Tag: 'span' | 'tspan' }) =>
  run.sanskrit ? <Tag lang="sa-Latn">{run.text}</Tag> : run.text

const Runs = ({ runs, Tag }: { runs: readonly Run[]; Tag: 'span' | 'tspan' }) =>
  runs.map((run) => <RunText key={run.text} run={run} Tag={Tag} />)

/** A label's lines stacked at a point, each drawn struck through where it is. */
function Lines({
  lines,
  at,
  className,
}: {
  lines: readonly Line[]
  at: Point
  className: string | undefined
}) {
  return (
    <g transform={`translate(${at[0]} ${at[1]})`}>
      {lines.map(({ runs, strike }, index) => {
        const lift = `${(index * LEADING - STRIKE_LIFT).toFixed(2)}em`
        return (
          <Fragment key={index}>
            <text className={className} y={`${index * LEADING}em`}>
              <Runs runs={runs} Tag="tspan" />
            </text>
            {strike ? (
              <line
                className={styles.strike}
                x1={`${-strike}em`}
                x2={`${strike}em`}
                y1={lift}
                y2={lift}
              />
            ) : null}
          </Fragment>
        )
      })}
    </g>
  )
}

function Arrow({ arrow: { curve, tone } }: { arrow: CycleArrow }) {
  return (
    <g className={styles.arrow} data-tone={tone}>
      <path className={styles.line} d={pathOf(curve)} pathLength={1} />
      <path className={styles.head} d="M -18 -10 L 0 0 L -18 10" transform={headOf(curve)} />
    </g>
  )
}

function ArrowLabel({ arrow: { label, labelAt } }: { arrow: CycleArrow }) {
  return (
    <text className={styles.label} x={labelAt[0]} y={labelAt[1]}>
      <Runs runs={[label]} Tag="tspan" />
    </text>
  )
}

/** A node's words for the list, each struck word in `<s>`, with the strike said in words. */
function NodeName({ node: { lines, joined } }: { node: CycleNode }) {
  const word = ({ runs, strike }: Line) => {
    const inner = <Runs runs={runs} Tag="span" />
    return strike ? <s>{inner}</s> : inner
  }
  const [first, second] = lines
  if (!first) return null
  const struck = lines.filter((line) => line.strike).length
  return (
    <>
      {word(first)}
      {second && joined === 'name' ? <> {word(second)}</> : null}
      {second && joined === 'gloss' ? <> ({word(second)})</> : null}
      {second && joined === 'pair' ? <>, {word(second)}</> : null}
      {struck === 1 ? ' (struck through)' : null}
      {struck > 1 ? ' (both struck through)' : null}
    </>
  )
}

/**
 * The Karma Yoga cycle from the old site, redrawn with real words: the five stages, the arrows
 * that turn one into the next, and the same steps again as a list. Not async, so it can call
 * useId for the ids its title and description are found by.
 */
export function KarmaCycle() {
  const titleId = useId()
  const descriptionId = useId()
  const { lines: centre, at: centreAt } = CYCLE_CENTRE

  return (
    <div className={styles.root}>
      <h3 className={styles.heading}>The cycle of action</h3>
      <figure id="karma-cycle" className={styles.figure}>
        <svg
          className={styles.drawing}
          role="img"
          aria-labelledby={`${titleId} ${descriptionId}`}
          viewBox="0 0 1080 740"
          focusable="false"
        >
          <title id={titleId}>{CYCLE_TITLE}</title>
          <desc id={descriptionId}>{CYCLE_DESCRIPTION}</desc>

          <g>
            {CYCLE_STEPS.map((step) => (
              <Arrow key={step.id} arrow={step} />
            ))}
            <Arrow arrow={CYCLE_LOKASAMGRAHA} />
          </g>

          {CYCLE_STEPS.map((step) => (
            <ArrowLabel key={step.id} arrow={step} />
          ))}
          <ArrowLabel arrow={CYCLE_LOKASAMGRAHA} />

          {CYCLE_NODES.map((node) => (
            <Lines key={node.id} lines={node.lines} at={node.at} className={styles.node} />
          ))}
          <Lines lines={centre} at={centreAt} className={styles.centre} />
        </svg>
        <figcaption className={styles.caption}>
          Read it clockwise, from <span lang="sa-Latn">Karmabija</span>.
        </figcaption>
      </figure>

      <details className={styles.disclosure}>
        <summary className={styles.summary}>
          Read the cycle as a list
          <span className={styles.icon} aria-hidden>
            <span />
            <span />
          </span>
        </summary>
        <ol className={styles.list}>
          {CYCLE_STEPS.map((step) => (
            <li key={step.id}>
              <NodeName node={step.from} /> leads, through{' '}
              <span lang="sa-Latn">{step.label.text}</span>, to <NodeName node={step.to} />.
            </li>
          ))}
          <li>
            <span lang="sa-Latn">{CYCLE_LOKASAMGRAHA.label.text}</span> also leads into{' '}
            <NodeName node={CYCLE_LOKASAMGRAHA.to} />.
          </li>
          <li>
            At the centre:{' '}
            {centre.map(({ runs }, index) => (
              <Fragment key={index}>
                {index > 0 ? ' ' : null}
                <Runs runs={runs} Tag="span" />
              </Fragment>
            ))}
            .
          </li>
        </ol>
      </details>
    </div>
  )
}

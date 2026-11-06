import { AzIndex } from './AzIndex'
import { AzLetter } from './AzLetter'
import type { AzModel } from './model'

/** The Concepts A–Z: the rail and chips over every letter's numbered entries. */
export function ConceptsAz({ model }: { model: AzModel }) {
  return (
    <AzIndex letters={model.rail} groups={model.groups} total={model.total}>
      {model.sections.map(({ letter, id, entries }) => (
        <AzLetter
          key={letter}
          letter={letter}
          id={id}
          entries={entries}
          topicNames={model.topicNames}
        />
      ))}
    </AzIndex>
  )
}

/**
 * The seam under the public interface: where records come from.
 *
 * A content source has one method, returning every record of a kind. The local source reads the
 * generated registry of record files, and `memorySource()` holds the made-up records tests build.
 * A CMS source implements the same method later and nothing above it changes.
 */
import type { ContentKind, ContentRecord, RecordOf } from './schema'

/**
 * Where records come from. An adapter owes the graph three duties:
 * - ids are unique within a kind (the graph refuses a duplicate);
 * - every record has the schema's shape (only the compiler checks this, not the run time);
 * - every text is Unicode NFC.
 * It may return records in any order: the graph sorts each kind by id.
 */
export interface ContentSource {
  /** Every record of one kind. */
  records<K extends ContentKind>(kind: K): Promise<readonly RecordOf<K>[]>
}

/** One record file as the generated registry lists it: its path under `data/`, and its record. */
export interface RegistryEntry {
  path: string
  record: ContentRecord
}

/** The command that writes the registry (scripts/content/registry.mjs). */
const REGISTRY_COMMAND = 'node scripts/content/registry.mjs'

type RegistryLoader = () => Promise<{ registry: readonly RegistryEntry[] }>

function isMissingModule(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const code = (error as Error & { code?: unknown }).code
  return (
    code === 'ERR_MODULE_NOT_FOUND' ||
    code === 'MODULE_NOT_FOUND' ||
    /cannot find module|failed to (?:load|resolve)|does not exist|can't resolve/i.test(
      error.message,
    )
  )
}

/** A content source over a registry module, loaded when content is first read. */
export function registrySource(load: RegistryLoader): ContentSource {
  return {
    async records<K extends ContentKind>(kind: K) {
      let registry: readonly RegistryEntry[]
      try {
        registry = (await load()).registry
      } catch (error) {
        if (!isMissingModule(error)) throw error
        throw new Error(
          `The content registry (src/content/generated/registry.ts) is missing or out of date. ` +
            `It is generated, never committed: write it with \`${REGISTRY_COMMAND}\`.`,
          { cause: error },
        )
      }
      return registry
        .map((entry) => entry.record)
        .filter((record): record is RecordOf<K> => record.kind === kind)
    },
  }
}

/** A content source over the given records, held in memory: the made-up sources tests build. */
export function memorySource(...records: readonly ContentRecord[]): ContentSource {
  return {
    async records<K extends ContentKind>(kind: K) {
      return records.filter((record): record is RecordOf<K> => record.kind === kind)
    },
  }
}

/**
 * The record files in `src/content/data/`, through the generated registry.
 * If the import below fails, the registry hasn't been written: run `node scripts/content/registry.mjs`.
 */
export const localSource: ContentSource = registrySource(() => import('./generated/registry'))

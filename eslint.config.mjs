import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'

// The content module's boundary. Outside src/content, code reads content only through its
// public interface, `@/content`: never an internal, and never the module by a relative path,
// whether imported or loaded with import(). A 'use client' file may import the interface for
// types only, with `import type`, so no content reaches the browser bundle; the same holds for
// the feature flags, since a browser bundle has no VERCEL_ENV and would switch every flag on.
// Tests build made-up sources, so they get one more entry, `@/content/testing`.
const CONTENT_INTERNAL = '^@/content/'
const CONTENT_BY_PATH = '^\\.{1,2}/(?:.+/)?content(?:/|$)'

// esquery's regex literals can't hold a slash, so each one is written \x2F.
const esqueryRegex = (source) => `/${source.replaceAll('/', '\\x2F')}/`

const clientOnlyTypes = (node, module, message) => ({
  selector: `Program:has(> ExpressionStatement[directive="use client"]) ${node}[source.value="${module}"]`,
  message,
})

const CLIENT_TYPES_ONLY = {
  '@/content': "A 'use client' file may import @/content for types only: use `import type`.",
  '@/config/features':
    "A 'use client' file may import @/config/features for types only: the browser has no VERCEL_ENV, so every flag would read on. Take the flag as a prop.",
}

const inClientFile = (node) =>
  Object.entries(CLIENT_TYPES_ONLY).map(([module, message]) =>
    clientOnlyTypes(node, module, message),
  )

const loadedWithImport = (pattern, message) => ({
  selector: `ImportExpression[source.value=${esqueryRegex(pattern)}]`,
  message,
})

const INTERNAL_MESSAGE = 'Content internals are private: import the public interface, @/content.'
const BY_PATH_MESSAGE = 'Reach the content module through @/content, never by a relative path.'

const contentBoundary = {
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/content/**'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { regex: CONTENT_INTERNAL, caseSensitive: true, message: INTERNAL_MESSAGE },
          { regex: CONTENT_BY_PATH, caseSensitive: true, message: BY_PATH_MESSAGE },
        ],
      },
    ],
    'no-restricted-syntax': [
      'error',
      loadedWithImport(CONTENT_INTERNAL, INTERNAL_MESSAGE),
      loadedWithImport(CONTENT_BY_PATH, BY_PATH_MESSAGE),
      ...inClientFile('ImportDeclaration[importKind!="type"]'),
      ...inClientFile('ExportNamedDeclaration[exportKind!="type"]'),
      ...inClientFile('ExportAllDeclaration[exportKind!="type"]'),
      ...inClientFile('ImportExpression'),
    ],
  },
}

const TESTING_ENTRY_MESSAGE =
  'Tests reach content internals through @/content/testing, or read @/content as pages do.'
const TEST_INTERNAL = '^@/content/(?!testing$)'
const TEST_BY_PATH = '^(?:\\.{1,2}/)+(?:src/)?content(?:/|$)'

const testsContentBoundary = {
  files: ['tests/**/*.ts'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { regex: TEST_INTERNAL, caseSensitive: true, message: TESTING_ENTRY_MESSAGE },
          { regex: TEST_BY_PATH, caseSensitive: true, message: TESTING_ENTRY_MESSAGE },
        ],
      },
    ],
    'no-restricted-syntax': [
      'error',
      loadedWithImport(TEST_INTERNAL, TESTING_ENTRY_MESSAGE),
      loadedWithImport(TEST_BY_PATH, TESTING_ENTRY_MESSAGE),
    ],
  },
}

// The graph sits below the views and the derivations that read it: an import upward would make
// a cycle, and the names it shares with them live in src/content/names.ts, under all three.
const graphBelowViews = {
  files: ['src/content/graph/**/*.ts'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            regex: '^(?:@/content|\\.\\.)/(?:views|derive)(?:/|$)',
            caseSensitive: true,
            message: 'The graph is below the views and the derivations: never import from them.',
          },
        ],
      },
    ],
  },
}

// Every internal link comes from hrefFor() (front-end-site spec, "Addresses"), so an address
// changes in one place. A path typed into an href fails, however it is written; a fragment
// (#main), another site (https://, //) and a path a view or hrefFor() made pass.
const INTERNAL_PATH = /^\/(?!\/)/

function startsInternal(node) {
  switch (node?.type) {
    case 'Literal':
      return typeof node.value === 'string' && INTERNAL_PATH.test(node.value)
    case 'TemplateLiteral':
      return INTERNAL_PATH.test(node.quasis[0]?.value.cooked ?? '')
    case 'BinaryExpression':
      return node.operator === '+' && startsInternal(node.left)
    case 'ConditionalExpression':
      return startsInternal(node.consequent) || startsInternal(node.alternate)
    case 'LogicalExpression':
      return startsInternal(node.left) || startsInternal(node.right)
    case 'JSXExpressionContainer':
    case 'TSAsExpression':
    case 'TSSatisfiesExpression':
    case 'TSNonNullExpression':
      return startsInternal(node.expression)
    case 'ObjectExpression':
      // Next's Link also takes { pathname }.
      return node.properties.some(
        (property) => keyOf(property) === 'pathname' && startsInternal(property.value),
      )
    default:
      return false
  }
}

const keyOf = (property) =>
  property.type !== 'Property' || property.computed
    ? undefined
    : (property.key.name ?? property.key.value)

const hrefFromHrefFor = {
  meta: {
    type: 'problem',
    docs: { description: 'Internal links come from hrefFor(), never a typed path.' },
    messages: {
      typed:
        'Make internal links with hrefFor() from @/content, not a typed path: an address then changes in one place.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name === 'href' && startsInternal(node.value))
          context.report({ node, messageId: 'typed' })
      },
      Property(node) {
        if (keyOf(node) === 'href' && startsInternal(node.value))
          context.report({ node, messageId: 'typed' })
      },
    }
  },
}

const internalLinks = {
  files: ['src/**/*.{ts,tsx}'],
  plugins: { care4mind: { rules: { 'href-from-hreffor': hrefFromHrefFor } } },
  rules: { 'care4mind/href-from-hreffor': 'error' },
}

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  // The jsx-a11y plugin is already registered by eslint-config-next; add its full recommended rule set.
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // A scrollable region (a wide table on a phone) must take keyboard focus so it can be scrolled.
      'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: [], roles: ['tabpanel', 'region'] }],
    },
  },
  ...tseslint.configs.strict.map((config) => ({ ...config, files: ['**/*.{ts,tsx}'] })),
  contentBoundary,
  testsContentBoundary,
  graphBelowViews,
  internalLinks,
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.scratch/**',
    'playwright-report/**',
    'test-results/**',
    '.lighthouseci/**',
    // Written by scripts/content/registry.mjs, never committed.
    'src/content/generated/**',
    // Agents' worktrees: whole copies of the repo, each linted in its own checkout.
    '.claude/worktrees/**',
  ]),
])

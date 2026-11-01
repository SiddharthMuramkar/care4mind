import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'

// The content module's boundary (content-v1 spec, "The boundary rule"). Outside src/content, code
// reads content only through its public interface, `@/content`: never an internal, and never
// the module by a relative path. A 'use client' file may import the interface for types only,
// with `import type`, so no content reaches the browser bundle. Tests are outside src and may
// also use the seam and the record schema to build made-up sources.
const inClientFile = (node) => ({
  selector: `Program:has(> ExpressionStatement[directive="use client"]) ${node}[source.value="@/content"]`,
  message: "A 'use client' file may import @/content for types only: use `import type`.",
})

const contentBoundary = {
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/content/**'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            regex: '^@/content/',
            caseSensitive: true,
            message: 'Content internals are private: import the public interface, @/content.',
          },
          {
            regex: '^\\.{1,2}/(?:.+/)?content(?:/|$)',
            caseSensitive: true,
            message: 'Reach the content module through @/content, never by a relative path.',
          },
        ],
      },
    ],
    'no-restricted-syntax': [
      'error',
      inClientFile('ImportDeclaration[importKind!="type"]'),
      inClientFile('ExportNamedDeclaration[exportKind!="type"]'),
      inClientFile('ExportAllDeclaration[exportKind!="type"]'),
      inClientFile('ImportExpression'),
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

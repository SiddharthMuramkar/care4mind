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
  ]),
])

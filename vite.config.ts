import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.mts'],
  },
  pack: {
    entry: ['src/index.ts'],
    minify: false,
    clean: true,
    sourcemap: true,
    format: 'esm',
    dts: true,
  },
  fmt: {
    semi: true,
    singleQuote: true,
    sortPackageJson: true,
    sortImports: {
      groups: [
        ['type-import'],
        ['type-builtin', 'value-builtin'],
        ['type-external', 'value-external', 'type-internal', 'value-internal'],
        [
          'type-parent',
          'type-sibling',
          'type-index',
          'value-parent',
          'value-sibling',
          'value-index',
        ],
        ['unknown'],
      ],
      newlinesBetween: true,
      order: 'asc',
    },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});

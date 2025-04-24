import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  minify: false,
  clean: true,
  sourcemap: true,
  format: ['cjs', 'esm'],
  dts: true,
})

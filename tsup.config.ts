import { defineConfig } from 'tsup'

export default defineConfig((overrideOptions) => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production'

  return {
    entry: ['src/index.ts', 'src/nitro/index.ts'],
    minify: isProd,
    clean: true,
    sourcemap: true,
    format: ['cjs', 'esm'],
    external: ['#imports'],
    dts: true,
  }
})

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly CLERK_PUBLISHABLE_KEY: string
  readonly CLERK_SECRET_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

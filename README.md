# h3-clerk

Unofficial Clerk middleware for H3.

## Install

```bash
pnpm add h3-clerk
```

## Usage

```ts
import { createApp, createError, eventHandler } from 'h3'
import { withClerkMiddleware } from 'h3-clerk'

const app = createApp()

app.use(withClerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}))

app.use(
  '/api/user',
  eventHandler((event) => {
    if (!event.context?.auth?.user)
      throw createError({ statusCode: 401 })

    return event.context.auth.user
  })
)
```

## TypeScript Shim

```ts
declare module 'h3' {
  interface H3EventContext {
    auth: SignedInAuthObject | SignedOutAuthObject
  }
}
```

## License

MIT

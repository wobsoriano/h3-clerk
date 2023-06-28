# h3-clerk

Unofficial [Clerk](https://clerk.com/) middleware for H3.

## Getting Started

To use this plugin you should first create a Clerk application and retrieve a `Secret Key` and a `Publishable Key` for you application (see [here](https://clerk.com/docs/reference/node/getting-started)) to be used as environment variables `CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`.

### Installation

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
    if (!event.context?.auth?.userId)
      throw createError({ statusCode: 401 })

    return { auth: event.context.auth }
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

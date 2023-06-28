# h3-clerk

Unofficial [Clerk](https://clerk.com/) middleware for H3.

Check [here](https://github.com/wobsoriano/nuxt-clerk-playground) for a demo with Nuxt.

## Getting Started

To use this middleware you should first create a Clerk application and retrieve a `Secret Key` and a `Publishable Key` for your application (see [here](https://clerk.com/docs/reference/node/getting-started)) to be used as environment variables `CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`.

### Installation

```bash
pnpm add h3-clerk
```

## Usage

```ts
import { createApp, eventHandler, setResponseStatus } from 'h3'
import { withClerkMiddleware } from 'h3-clerk'

const app = createApp()

app.use(withClerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}))

app.use(
  '/private',
  eventHandler((event) => {
    if (!event.context.auth.userId) {
      setResponseStatus(event, 403)
      return ''
    }

    return { hello: 'world' }
  })
)
```

## TypeScript Shim

```ts
declare module 'h3' {
  interface H3EventContext {
    auth: import('@clerk/backend').SignedInAuthObject | import('@clerk/backend').SignedOutAuthObject
  }
}
```

## License

MIT

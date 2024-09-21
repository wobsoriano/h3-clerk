# h3-clerk

Unofficial [Clerk](https://clerk.com/) middleware for H3.

Check [here](https://github.com/wobsoriano/nuxt-clerk-playground) for a demo with Nuxt.

## Getting Started

To use this middleware you should first create a Clerk application and retrieve a `Secret Key` and a `Publishable Key` for your application (see [here](https://clerk.com/docs/reference/node/getting-started)) to be used as environment variables `CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`.

### Installation

```bash
npm install h3-clerk
```

## Usage

```ts
import { createApp, createError, eventHandler, setResponseStatus } from 'h3'
import { clerkClient, getAuth, withClerkMiddleware } from 'h3-clerk'

const app = createApp()

app.use(withClerkMiddleware())

app.use('/protected-endpoint', async (event) => {
  const { userId } = getAuth(event)

  if (!userId) {
    setResponseStatus(event, 401, 'Unauthorized')
    return
  }

  const user = await clerkClient.users.getUser(userId)

  return { user }
})
```

## TypeScript Shim

```ts
import type { AuthObject } from '@clerk/backend'

declare module 'h3' {
  interface H3EventContext {
    auth: AuthObject
  }
}
```

## License

MIT

# h3-clerk

Unofficial [Clerk](https://clerk.com/) middleware for H3.

## Getting Started

To use this middleware you should first create a Clerk application and retrieve a `Secret Key` and a `Publishable Key` for your application (see [here](https://clerk.com/docs/reference/node/getting-started)) to be used as environment variables `CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`.

### Installation

```bash
npm install h3-clerk
```

## Usage

```ts
import { createApp, eventHandler, setResponseStatus } from 'h3'
import { clerkClient, clerkMiddleware, getAuth } from 'h3-clerk'

const app = createApp()

app.use(clerkMiddleware())

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

## Available methods

### `clerkMiddleware()`

The `clerkMiddleware()` middleware integrates Clerk authentication into your H3 application. It is required to be set in the middleware chain before using other Clerk utilities, such as `getAuth()`.

```ts
import { createApp } from 'h3'
import { clerkMiddleware } from 'h3-clerk'

const app = createApp()

app.use(clerkMiddleware())
```

#### Options

The `clerkMiddleware()` middleware accepts [these options](https://clerk.com/docs/references/nextjs/clerk-middleware#clerk-middleware-options) plus the following:

- `enableHandshake` - Enables Clerk's handshake flow, which helps verify the session state when a session JWT has expired. It issues a 307 redirect to refresh the session JWT if the user is still logged in.

### `getAuth()`

The `getAuth()` function retrieves authentication state from the [event object](https://h3.unjs.io/guide/event).

```ts
import { createApp, eventHandler, setResponseStatus } from 'h3'
import { clerkMiddleware, getAuth } from 'h3-clerk'

const app = createApp()

app.use(clerkMiddleware())

app.use('/protected-endpoint', async (event) => {
  const { userId, has } = getAuth(event)

  if (!userId || !has({ role: 'org:admin' })) {
    setResponseStatus(event, 401, 'Unauthorized')
    return
  }

  return { message: 'Hello, admin' }
})
```

### `clerkClient`

[Clerk's JavaScript Backend SDK](https://clerk.com/docs/references/backend/overview) exposes Clerk's Backend API resources and low-level authentication utilities for JavaScript environments. For example, if you wanted to get a list of all users in your application, instead of creating a fetch to Clerk's `https://api.clerk.com/v1/users` endpoint, you can use the `users.getUserList()` method provided by the JavaScript Backend SDK.

All resource operations are mounted as sub-APIs on the `clerkClient` object. See the [reference documentation](https://clerk.com/docs/references/backend/overview#usage) for more information.

```ts
import { clerkClient } from 'h3-clerk'

app.use('/users', async (event) => {
  const users = await clerkClient.users.getUserList()

  return { users }
})
```

## License

MIT

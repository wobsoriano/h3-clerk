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
import { createApp, createError, eventHandler } from 'h3'
import { clerkClient, withClerkAuth, withClerkMiddleware } from 'h3-clerk'

const app = createApp()

// For all routes
app.use(withClerkMiddleware())
app.use('/protected-endpoint', async (event) => {
  const { userId } = event.context.auth

  if (!userId)
    throw createError({ statusCode: 403 })

  const user = await clerkClient.users.getUser(userId)

  return { user }
})

// For a specific route
app.use(
  '/protected-endpoint',
  withClerkAuth(async (event) => {
    const { userId } = event.context.auth

    if (!userId)
      throw createError({ statusCode: 403 })

    const user = await clerkClient.users.getUser(userId)

    return { user }
  })
)
```

## Options

| Name                | Type                                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|---------------------|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `authorizedParties` | `string[]`                                  | Validate that the `azp` claim in the Clerk Session JWT equals any of your known origins that are permitted to generate those tokens. This is an extra security check that we highly recommend that you do. For more information, refer to [Manual JWT Verification](https://clerk.com/docs/backend-requests/handling/manual-jwt). E.g. `['http://localhost:4003', 'https://clerk.dev']`                                                                                                                                                  |
| `jwtKey`            | `string`                                    | Clerk's JWT session token can be verified in a networkless manner using the JWT verification key. By default, Clerk will use our well-known JWKs endpoint to fetch and cache the key for any subsequent token verification. If you use the `CLERK_JWT_KEY` environment variable or the jwtKey option to supply the key, Clerk will pick it up and do networkless verification for session tokens using it. For more information, refer to [Networkless Token Verification](https://clerk.com/docs/references/nodejs/token-verification#validate-the-authorized-party-of-a-session-token). |
| `onError`           | `(error: ClerkAPIResponseError) => unknown` | This function can act as a custom error handler tailored to the needs of your application.                                                                                                                                                                                                                                                                                                                                                                              |

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

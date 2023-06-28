# h3-clerk

Unofficial Clerk middleware for H3.

## Install

```bash
pnpm add h3-clerk
```

## Usage

```ts
import { createServer } from 'node:http'
import { createApp, eventHandler, toNodeListener } from 'h3'
import { withClerkMiddleware } from 'h3-clerk'

const app = createApp()

app.use(withClerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}))

app.use(
  '/',
  eventHandler(() => 'Hello world!')
)

createServer(toNodeListener(app)).listen(process.env.PORT || 3000)
```

## License

MIT

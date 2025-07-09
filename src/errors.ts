function createErrorMessage(msg: string) {
  return `🔒 H3 Clerk: ${msg.trim()}

For more info, check out the repo: https://github.com/wobsoriano/h3-clerk#usage.
`
}

export const middlewareRegistrationRequired
  = createErrorMessage(`The "clerkMiddleware()" middleware should be registered before using the "getAuth".
Example:

import { createApp } from 'h3'
import { clerkMiddleware } from 'h3-clerk'

const app = createApp()
app.use(clerkMiddleware())
`)

export const handshakeWithoutRedirect = 'Clerk: handshake status without redirect'

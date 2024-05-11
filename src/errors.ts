function createErrorMessage(msg: string) {
  return `🔒 H3 Clerk: ${msg.trim()}

For more info, check out the repo: https://github.com/wobsoriano/h3-clerk#usage.
`
}

export const middlewareRegistrationRequired
  = createErrorMessage(`The "withClerkMiddleware" should be registered before using the "getAuth".
Example:

import { createApp } from 'h3'
import { withClerkMiddleware } from 'h3-clerk'

const app = createApp()
app.use(withClerkMiddleware())
`)

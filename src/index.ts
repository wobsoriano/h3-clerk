import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { eventHandler, fromNodeMiddleware } from 'h3'
import type { H3Event, EventHandler, NodeMiddleware } from 'h3'
import type { ClerkOptions, SignedInAuthObject, SignedOutAuthObject } from '@clerk/clerk-sdk-node'

// needed until https://github.com/clerkinc/javascript/issues/1740 is resolved
const preventCrossOriginReferer = (event: H3Event) => {
  if (process.dev) delete event.node.req.headers.referer
}

export function withClerkMiddleware(options?: ClerkOptions) {
  return eventHandler({
    onRequest: [
      preventCrossOriginReferer,
      fromNodeMiddleware(ClerkExpressWithAuth(options) as NodeMiddleware),
    ],
    async handler(event) {
      // @ts-expect-error: Clerk Node attaches auth object to req.auth
      event.context.auth = event.node.req.auth
    },
  })
}

export function withClerkAuth(handler: EventHandler, options?: ClerkOptions) {
  return eventHandler({
    onRequest: [
      preventCrossOriginReferer,
      fromNodeMiddleware(ClerkExpressWithAuth(options) as NodeMiddleware),
    ],
    async handler(event) {
      // @ts-expect-error: Clerk Node attaches auth object to req.auth
      event.context.auth = event.node.req.auth

      return handler(event)
    },
  })
}

export { Clerk, clerkClient, createClerkClient } from '@clerk/clerk-sdk-node'

declare module 'h3' {
  interface H3EventContext {
    auth: SignedInAuthObject | SignedOutAuthObject
  }
}

import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { type ClerkOptions, type SignedInAuthObject, type SignedOutAuthObject } from '@clerk/backend'
import { eventHandler, fromNodeMiddleware } from 'h3'
import type { EventHandler, NodeMiddleware } from 'h3'

export function withClerkMiddleware(options?: ClerkOptions) {
  return eventHandler({
    onRequest: [fromNodeMiddleware(ClerkExpressWithAuth(options) as NodeMiddleware)],
    async handler(event) {
      // @ts-expect-error: Clerk Node attaches auth object to req.auth
      event.context.auth = event.node.req.auth
    },
  })
}

export function withClerkAuth(handler: EventHandler, options?: ClerkOptions) {
  return eventHandler({
    onRequest: [fromNodeMiddleware(ClerkExpressWithAuth(options) as NodeMiddleware)],
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

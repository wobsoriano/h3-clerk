import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { eventHandler, fromNodeMiddleware, getRequestProtocol } from 'h3'
import type { EventHandler, H3Event, NodeMiddleware } from 'h3'
import type { ClerkMiddlewareOptions, SignedInAuthObject, SignedOutAuthObject } from '@clerk/clerk-sdk-node'

export function withClerkMiddleware(options?: ClerkMiddlewareOptions) {
  return eventHandler({
    onRequest: [fromNodeMiddleware(ClerkExpressWithAuth(options) as NodeMiddleware)],
    async handler(event) {
      // @ts-expect-error: Clerk Node attaches auth object to req.auth
      event.context.auth = event.node.req.auth
    },
  })
}

export function withClerkAuth(handler: EventHandler, options?: ClerkMiddlewareOptions) {
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

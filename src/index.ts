import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { eventHandler, fromNodeMiddleware } from 'h3'
import type { EventHandler } from 'h3'
import type { ClerkMiddlewareOptions } from '@clerk/clerk-sdk-node'
import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/dist/internal'

export function withClerkMiddleware(options?: ClerkMiddlewareOptions) {
  return eventHandler({
    onRequest: [fromNodeMiddleware(ClerkExpressWithAuth(options))],
    async handler(event) {
      // @ts-expect-error: Clerk Node attaches auth object to req.auth
      event.context.auth = event.node.req.auth
    },
  })
}

export function withClerkAuth(handler: EventHandler, options?: ClerkMiddlewareOptions) {
  return eventHandler({
    onRequest: [fromNodeMiddleware(ClerkExpressWithAuth(options))],
    async handler(event) {
      // @ts-expect-error: Clerk Node attaches auth object to req.auth
      event.context.auth = event.node.req.auth

      return handler(event)
    },
  })
}

export * from '@clerk/clerk-sdk-node'

declare module 'h3' {
  interface H3EventContext {
    auth: SignedInAuthObject | SignedOutAuthObject
  }
}

import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { eventHandler, fromNodeMiddleware, getRequestProtocol } from 'h3'
import type { EventHandler, H3Event, NodeMiddleware } from 'h3'
import type { ClerkMiddlewareOptions, SignedInAuthObject, SignedOutAuthObject } from '@clerk/clerk-sdk-node'

// needed until https://github.com/nuxt/nuxt/issues/23348 is resolved
function fixProtoHeaderInDevMode(event: H3Event) {
  if (process.env.NODE_ENV === 'development')
    event.node.req.headers['x-forwarded-proto'] = getRequestProtocol(event)
}

type H3ClerkMiddlewareOptions = ClerkMiddlewareOptions & {
  /**
   * Adjusts the `x-forwarded-proto` header in development mode to match the protocol of the request. Temporary hacky fix to https://github.com/nuxt/nuxt/issues/23348.
   */
  adjustProtoHeaderInDev?: boolean
}

export function withClerkMiddleware(options: H3ClerkMiddlewareOptions = { adjustProtoHeaderInDev: true }) {
  return eventHandler({
    onRequest: [
      options.adjustProtoHeaderInDev ? fixProtoHeaderInDevMode : () => {},
      fromNodeMiddleware(ClerkExpressWithAuth(options) as NodeMiddleware),
    ],
    async handler(event) {
      // @ts-expect-error: Clerk Node attaches auth object to req.auth
      event.context.auth = event.node.req.auth
    },
  })
}

export function withClerkAuth(handler: EventHandler, options: H3ClerkMiddlewareOptions = { adjustProtoHeaderInDev: true }) {
  return eventHandler({
    onRequest: [
      options?.adjustProtoHeaderInDev ? fixProtoHeaderInDevMode : () => {},
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

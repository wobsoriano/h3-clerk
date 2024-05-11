import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { eventHandler, fromNodeMiddleware } from 'h3'
import type { EventHandler, H3Event } from 'h3'
import type { ClerkMiddlewareOptions } from '@clerk/clerk-sdk-node'
import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/internal'
import { middlewareRegistrationRequired } from './errors'

function patchResponseStatus() {
  return eventHandler((event) => {
    // See https://github.com/clerk/javascript/blob/1662aaae965fcf36b13dba6b148e096ab6a1cd83/packages/sdk-node/src/authenticateRequest.ts#L76C5-L76C15
    // @ts-expect-error: Patch res.status() from express
    event.node.res.status = (statusCode: number) => {
      event.node.res.statusCode = statusCode
      return event.node.res
    }
  })
}

export function withClerkMiddleware(options?: ClerkMiddlewareOptions) {
  return eventHandler({
    onRequest: [
      patchResponseStatus(),
      fromNodeMiddleware(ClerkExpressWithAuth(options)),
    ],
    async handler(event) {
      // @ts-expect-error: Clerk Node attaches auth object to req.auth
      event.context.auth = event.node.req.auth
    },
  })
}

export function withClerkAuth(handler: EventHandler, options?: ClerkMiddlewareOptions) {
  return eventHandler({
    onRequest: [
      patchResponseStatus(),
      fromNodeMiddleware(ClerkExpressWithAuth(options)),
    ],
    async handler(event) {
      // @ts-expect-error: Clerk Node attaches auth object to req.auth
      event.context.auth = event.node.req.auth

      return handler(event)
    },
  })
}

export function getAuth(event: H3Event) {
  if (!event.context.auth)
    throw new Error(middlewareRegistrationRequired)

  return event.context.auth
}

export * from '@clerk/clerk-sdk-node'

declare module 'h3' {
  interface H3EventContext {
    auth: SignedInAuthObject | SignedOutAuthObject
  }
}

import type { ClerkOptions } from '@clerk/backend'
import type { H3Event } from 'h3'
import { eventHandler, getRequestHeaders, getRequestProtocol, setResponseHeader } from 'h3'
import { AuthStatus, type SignedInAuthObject, type SignedOutAuthObject } from '@clerk/backend/internal'
import { clerkClient } from './clerkClient'
import * as constants from './constants'
import { handshakeWithoutRedirect } from './errors'

function toWebRequest(event: H3Event) {
  const headers = getRequestHeaders(event) as HeadersInit
  const protocol = getRequestProtocol(event)
  const dummyOriginReqUrl = new URL(event.node.req.url || '', `${protocol}://clerk-dummy`)
  return new Request(dummyOriginReqUrl, {
    method: event.method,
    headers: new Headers(headers),
  })
}

export function withClerkMiddleware(options?: ClerkOptions) {
  return eventHandler(async (event) => {
    const clerkRequest = toWebRequest(event)

    const requestState = await clerkClient.authenticateRequest(clerkRequest, {
      ...options,
      secretKey: options?.secretKey ?? constants.SECRET_KEY,
      publishableKey: options?.publishableKey ?? constants.PUBLISHABLE_KEY,
    })

    const locationHeader = requestState.headers.get(constants.Headers.Location)
    if (locationHeader) {
      // Trigger a handshake redirect
      return new Response(null, { status: 307, headers: requestState.headers })
    }

    if (requestState.status === AuthStatus.Handshake) {
      throw new Error(handshakeWithoutRedirect)
    }

    if (requestState.headers) {
      requestState.headers.forEach((value, key) => {
        setResponseHeader(event, key, value)
      })
    }

    event.context.auth = requestState.toAuth()
  })
}

declare module 'h3' {
  interface H3EventContext {
    auth: SignedInAuthObject | SignedOutAuthObject | null
  }
}

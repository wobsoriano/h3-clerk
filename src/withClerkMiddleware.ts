import type { ClerkOptions } from '@clerk/backend'
import { eventHandler, setResponseHeader, toWebRequest } from 'h3'
import { AuthStatus, type SignedInAuthObject, type SignedOutAuthObject } from '@clerk/backend/internal'
import { clerkClient } from './clerkClient'
import * as constants from './constants'
import { handshakeWithoutRedirect } from './errors'

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

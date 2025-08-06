import type { AuthObject, ClerkOptions } from '@clerk/backend'
import { AuthStatus, TokenType } from '@clerk/backend/internal'
import { eventHandler } from 'h3'
import { clerkClient } from './clerkClient'
import * as constants from './constants'
import { handshakeWithoutRedirect } from './errors'

export function clerkMiddleware(options?: ClerkOptions) {
  return eventHandler(async (event) => {
    const requestState = await clerkClient.authenticateRequest(event.req, {
      ...options,
      secretKey: options?.secretKey ?? constants.SECRET_KEY,
      publishableKey: options?.publishableKey ?? constants.PUBLISHABLE_KEY,
      acceptsToken: TokenType.SessionToken,
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
        event.res.headers.set(key, value)
      })
    }

    event.context.auth = requestState.toAuth()
  })
}

declare module 'h3' {
  interface H3EventContext {
    auth: AuthObject | null
  }
}

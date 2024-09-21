import type { AuthObject, ClerkOptions } from '@clerk/backend'
import { AuthStatus } from '@clerk/backend/internal'
import { eventHandler, setResponseHeader } from 'h3'
import { clerkClient } from './clerkClient'
import * as constants from './constants'
import { handshakeWithoutRedirect } from './errors'
import { toWebRequest } from './utils'

export type H3ClerkOptions = ClerkOptions & {
  enableHandshake?: boolean
}

export function withClerkMiddleware(options?: H3ClerkOptions) {
  const enableHandshake = options?.enableHandshake ?? false
  return eventHandler(async (event) => {
    const clerkRequest = toWebRequest(event)

    const requestState = await clerkClient.authenticateRequest(clerkRequest, {
      ...options,
      secretKey: options?.secretKey ?? constants.SECRET_KEY,
      publishableKey: options?.publishableKey ?? constants.PUBLISHABLE_KEY,
    })

    if (enableHandshake) {
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
    }

    event.context.auth = requestState.toAuth()
  })
}

declare module 'h3' {
  interface H3EventContext {
    auth: AuthObject | null
  }
}

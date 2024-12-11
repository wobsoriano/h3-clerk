import type { AuthObject, ClerkOptions } from '@clerk/backend'
import { AuthStatus } from '@clerk/backend/internal'
import { eventHandler, setResponseHeader } from 'h3'
import { handshakeWithoutRedirect } from '../errors'
import { toWebRequest } from '../utils'
import { clerkClient } from './clerkClient'

export function withClerkMiddleware(options?: ClerkOptions) {
  return eventHandler(async (event) => {
    const clerkRequest = toWebRequest(event)

    const requestState = await clerkClient(event).authenticateRequest(clerkRequest, options)

    const locationHeader = requestState.headers.get('location')
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
    auth: AuthObject | null
  }
}

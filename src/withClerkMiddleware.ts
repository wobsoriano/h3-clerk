/**
 * This middleware is a port of the official Fastify Clerk middleware.
 *
 * Credits to the Clerk team.
 * https://github.com/clerkinc/javascript/blob/main/packages/fastify/src/withClerkMiddleware.ts
 */

import { type ClerkOptions, type SignedInAuthObject, type SignedOutAuthObject, createIsomorphicRequest } from '@clerk/backend'
import { type EventHandler, eventHandler, getHeaders, getMethod, getRequestURL, setResponseHeaders, setResponseStatus } from 'h3'
import * as constants from './constants'
import { clerkClient } from './clerkClient'

export type ClerkH3Options = Omit<ClerkOptions, 'apiKey'>

function handleClerkRequest(options?: ClerkH3Options, handler?: EventHandler) {
  return eventHandler(async (event) => {
    const secretKey = options?.secretKey ?? constants.SECRET_KEY
    const publishableKey = options?.publishableKey ?? constants.PUBLISHABLE_KEY

    const requestState = await clerkClient.authenticateRequest({
      ...options,
      secretKey,
      publishableKey,
      apiKey: constants.API_KEY,
      frontendApi: constants.FRONTEND_API,
      request: createIsomorphicRequest((Request, Headers) => {
        const requestHeaders = getHeaders(event) as Record<string, string>
        const reqUrl = getRequestURL(event)
        const headers = new Headers(requestHeaders)

        return new Request(reqUrl, {
          method: getMethod(event),
          headers,
        })
      }),
    })

    // Interstitial cases
    if (requestState.isUnknown) {
      setResponseStatus(event, 401)
      setResponseHeaders(event, {
        [constants.Headers.AuthReason]: requestState.reason,
        [constants.Headers.AuthMessage]: requestState.message,
      })
      return ''
    }

    if (requestState.isInterstitial) {
      const interstitialHtmlPage = clerkClient.localInterstitial({
        publishableKey,
        frontendApi: constants.FRONTEND_API,
      })
      setResponseStatus(event, 401)
      setResponseHeaders(event, {
        [constants.Headers.AuthReason]: requestState.reason,
        [constants.Headers.AuthMessage]: requestState.message,
      })

      return interstitialHtmlPage
    }

    event.context.auth = requestState.toAuth()

    if (handler)
      return handler(event)
  })
}

export function withClerkMiddleware(options: ClerkH3Options) {
  return handleClerkRequest(options)
}

export function withClerkAuth<T>(handler: EventHandler<T>, options?: ClerkH3Options) {
  return handleClerkRequest(options, handler)
}

declare module 'h3' {
  interface H3EventContext {
    auth: SignedInAuthObject | SignedOutAuthObject
  }
}

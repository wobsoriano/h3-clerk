/**
 * This middleware is a port of the official Fastify Clerk middleware.
 *
 * Credits to the Clerk team.
 * https://github.com/clerkinc/javascript/blob/main/packages/fastify/src/withClerkMiddleware.ts
 */
import { type ClerkOptions, type SignedInAuthObject, type SignedOutAuthObject, createIsomorphicRequest } from '@clerk/backend'
import { eventHandler, getHeaders, getMethod, setResponseHeaders, setResponseStatus } from 'h3'
import * as constants from './constants'
import { getSingleValueFromArrayHeader } from './utils'
import { clerkClient } from './clerkClient'

export type ClerkH3Options = Omit<ClerkOptions, 'apiKey'>

const DUMMY_URL_BASE = 'http://clerk-dummy'

export function withClerkMiddleware(options: ClerkH3Options) {
  return eventHandler(async (event) => {
    const secretKey = options.secretKey || constants.SECRET_KEY
    const publishableKey = options.publishableKey || constants.PUBLISHABLE_KEY

    const requestState = await clerkClient.authenticateRequest({
      ...options,
      secretKey,
      publishableKey,
      apiKey: constants.API_KEY,
      frontendApi: constants.FRONTEND_API,
      request: createIsomorphicRequest((Request, Headers) => {
        const requestHeaders = Object.keys(getHeaders(event)).reduce(
          (acc, key) => Object.assign(acc, { [key]: getHeaders(event)[key] }),
          {},
        )
        const headers = new Headers(requestHeaders)
        const forwardedHostHeader = getSingleValueFromArrayHeader(
          headers?.get(constants.Headers.ForwardedHost) || undefined,
        )
        if (forwardedHostHeader)
          headers.set(constants.Headers.ForwardedHost, forwardedHostHeader)

        const forwardedPortHeader = getSingleValueFromArrayHeader(
          headers?.get(constants.Headers.ForwardedPort) || undefined,
        )
        if (forwardedPortHeader)
          headers.set(constants.Headers.ForwardedPort, forwardedPortHeader)

        const reqUrl = isRelativeUrl(event.node.req.url!) ? getAbsoluteUrlFromHeaders(event.node.req.url!, headers) : event.node.req.url!
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
  })
}

// TODO: Move the utils below to shared package
// Creating a Request object requires a valid absolute URL
// Fastify's req.url is relative, so we need to construct an absolute URL
function getAbsoluteUrlFromHeaders(url: string, headers: Headers): URL {
  const forwardedProto = headers.get(constants.Headers.ForwardedProto)
  const forwardedPort = headers.get(constants.Headers.ForwardedPort)
  const forwardedHost = headers.get(constants.Headers.ForwardedHost)

  const fwdProto = getFirstValueFromHeaderValue(forwardedProto)
  let fwdPort = getFirstValueFromHeaderValue(forwardedPort)

  // If forwardedPort mismatch with forwardedProto determine forwardedPort
  // from forwardedProto as fallback (if exists)
  // This check fixes the Railway App issue
  const fwdProtoHasMoreValuesThanFwdPorts
    = (forwardedProto || '').split(',').length > (forwardedPort || '').split(',').length
  if (fwdProto && fwdProtoHasMoreValuesThanFwdPorts)
    fwdPort = getPortFromProtocol(fwdProto)

  try {
    return new URL(url, `${fwdProto}://${forwardedHost}${fwdPort ? `:${fwdPort}` : ''}`)
  }
  catch (e) {
    return new URL(url, DUMMY_URL_BASE)
  }
}

const PROTOCOL_TO_PORT_MAPPING: Record<string, string> = {
  http: '80',
  https: '443',
} as const

function getPortFromProtocol(protocol: string) {
  return PROTOCOL_TO_PORT_MAPPING[protocol]
}

function getFirstValueFromHeaderValue(value?: string | null) {
  return value?.split(',')[0]?.trim() || ''
}

function isRelativeUrl(url: string) {
  const u = new URL(url, DUMMY_URL_BASE)
  return u.origin === DUMMY_URL_BASE
}

declare module 'h3' {
  interface H3EventContext {
    auth: SignedInAuthObject | SignedOutAuthObject
  }
}

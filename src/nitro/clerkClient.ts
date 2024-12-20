import type { H3Event } from 'h3'
import { createClerkClient } from '@clerk/backend'
import { isTruthy } from '@clerk/shared/underscore'

export function clerkClient(event: H3Event) {
  const runtimeConfig = event.context.nitro.runtimeConfig

  return createClerkClient({
    publishableKey: runtimeConfig.clerkPublishableKey,
    apiUrl: runtimeConfig.clerkApiUrl,
    apiVersion: runtimeConfig.clerkApiVersion,
    proxyUrl: runtimeConfig.clerkProxyUrl,
    domain: runtimeConfig.clerkDomain,
    isSatellite: runtimeConfig.clerkIsSatellite,
    secretKey: runtimeConfig.clerkSecretKey,
    jwtKey: runtimeConfig.clerkJwtKey,
    telemetry: {
      disabled: isTruthy(runtimeConfig.clerkTelemetryDisabled),
      debug: isTruthy(runtimeConfig.clerkTelemetryDebug),
    },
  })
}

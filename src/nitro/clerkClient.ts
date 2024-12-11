import type { H3Event } from 'h3'
import { createClerkClient } from '@clerk/backend'
import { isTruthy } from '@clerk/shared/underscore'
// @ts-expect-error: Nitro internal
import { useRuntimeConfig } from '#imports'

export function clerkClient(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event) as Record<string, any>

  return createClerkClient({
    publishableKey: runtimeConfig.clerk.publishableKey,
    apiUrl: runtimeConfig.clerk.apiUrl,
    apiVersion: runtimeConfig.clerk.apiVersion,
    proxyUrl: runtimeConfig.clerk.proxyUrl,
    domain: runtimeConfig.clerk.domain,
    isSatellite: runtimeConfig.clerk.isSatellite,
    secretKey: runtimeConfig.clerk.secretKey,
    jwtKey: runtimeConfig.clerk.jwtKey,
    telemetry: {
      disabled: isTruthy(runtimeConfig.clerk.telemetry?.disabled),
      debug: isTruthy(runtimeConfig.clerk.telemetry?.debug),
    },
  })
}

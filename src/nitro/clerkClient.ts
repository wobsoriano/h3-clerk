import type { H3Event } from 'h3'
import { createClerkClient } from '@clerk/backend'
import { isTruthy } from '@clerk/shared/underscore'
import { useRuntimeConfig } from 'nitropack/runtime'

export function clerkClient(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)

  return createClerkClient({
    publishableKey: runtimeConfig.publishableKey,
    apiUrl: runtimeConfig.apiUrl,
    apiVersion: runtimeConfig.apiVersion,
    proxyUrl: runtimeConfig.proxyUrl,
    domain: runtimeConfig.domain,
    isSatellite: runtimeConfig.isSatellite,
    secretKey: runtimeConfig.secretKey,
    jwtKey: runtimeConfig.jwtKey,
    telemetry: {
      disabled: isTruthy(runtimeConfig.telemetry?.disabled),
      debug: isTruthy(runtimeConfig.telemetry?.debug),
    },
  })
}

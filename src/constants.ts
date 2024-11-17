import { constants } from '@clerk/backend/internal'
import { isTruthy } from '@clerk/shared/underscore'

export const API_VERSION = process.env.CLERK_API_VERSION || 'v1'
export const SECRET_KEY = process.env.CLERK_SECRET_KEY || ''
export const PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || ''
export const API_URL = process.env.CLERK_API_URL || 'https://api.clerk.com'
export const JWT_KEY = process.env.CLERK_JWT_KEY || ''
export const TELEMETRY_DISABLED = isTruthy(process.env.CLERK_TELEMETRY_DISABLED)
export const TELEMETRY_DEBUG = isTruthy(process.env.CLERK_TELEMETRY_DEBUG)

export const { Cookies, Headers } = constants

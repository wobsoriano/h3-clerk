import createFetchMock from 'vitest-fetch-mock'
import { vi } from 'vitest'

const fetchMocker = createFetchMock(vi)
fetchMocker.enableMocks()

process.env.CLERK_API_KEY = 'TEST_API_KEY'
process.env.CLERK_SECRET_KEY = 'TEST_API_KEY'

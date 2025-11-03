import { vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'

const fetchMocker = createFetchMock(vi)
fetchMocker.enableMocks()

process.env.CLERK_SECRET_KEY = 'TEST_SECRET_KEY'
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_'

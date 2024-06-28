import createFetchMock from 'vitest-fetch-mock'
import { vi } from 'vitest'

const fetchMocker = createFetchMock(vi)
fetchMocker.enableMocks()

process.env.CLERK_SECRET_KEY = 'TEST_SECRET_KEY'
// don't bother, this is for tests only >:)
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_dGlnaHQtcmFiYml0LTk0LmNsZXJrLmFjY291bnRzLmRldiQ'

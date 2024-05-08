import createFetchMock from 'vitest-fetch-mock'
import { vi } from 'vitest'

const fetchMocker = createFetchMock(vi)
fetchMocker.enableMocks()

process.env.CLERK_SECRET_KEY = 'sk_test_....'
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_dGlnaHQtcmFiYml0LTk0LmNsZXJrLmFjY291bnRzLmRldiQ'

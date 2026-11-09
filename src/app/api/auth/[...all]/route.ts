import { features } from '@/config/features'
import { getAuth } from '@/lib/auth/auth'
import { authRoute } from '@/lib/auth/route-handler'

export const { GET, POST } = authRoute({ features, getAuth })

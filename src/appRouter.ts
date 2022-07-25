import * as trpc from '@trpc/server'
import { adminRouter } from './routes/adminRouter'
import { authRouter } from './routes/authRouter'
import { userRouter } from './routes/userRouter'
import type { Context } from './server'

export const appRouter = trpc
    .router<Context>()
    .merge('admin/', adminRouter)
    .merge('auth/', authRouter)
    .merge('user/', userRouter)

export type AppRouter = typeof appRouter
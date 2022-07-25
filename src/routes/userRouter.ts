import * as trpc from '@trpc/server'
import { z } from 'zod'
import { verifyToken } from '../jwt'
import type { Context } from '../server'

// TODO: Add posts to user routes
export const userRouter = trpc
    .router<Context>()
    .middleware(async ({ ctx, next }) => {
        const token = ctx.req.headers.authorization

        if (!token) {
            throw new trpc.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'No token provided',
            })
        }

        if (!token.startsWith('Bearer ')) {
            throw new trpc.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Invalid token',
            })
        }

        const tokenWithoutBearer = token.slice(7)
        const decoded = verifyToken(tokenWithoutBearer) 

        if (decoded instanceof trpc.TRPCError) {
            throw decoded
        }

        return next()
    })
    .query('ping', {
        input: z.void(),
        output: z.string(),
        resolve: () => 'pong',
    })
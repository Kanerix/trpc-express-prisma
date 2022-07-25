import { PrismaClient } from '@prisma/client'
import type * as trpc from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import express from 'express'
import { appRouter } from './appRouter'
import { verifyToken } from './jwt'

const app = express()

const prisma = new PrismaClient()

const createContext = ({ req }: trpcExpress.CreateExpressContextOptions) => {
    const token = req.headers.authorization?.slice(7) ?? ''

    const user = verifyToken(token)

    return { prisma, user }
} 

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        createContext,
        router: appRouter,
    })
)

app.listen(4000)
console.log('Server started on port 4000')
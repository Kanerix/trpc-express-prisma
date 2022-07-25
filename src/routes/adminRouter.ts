import { Role } from '@prisma/client'
import * as trpc from '@trpc/server'
import { z } from 'zod'
import { verifyToken } from '../jwt'
import type { Context } from '../server'

export const adminRouter = trpc.
    router<Context>()
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
                message: 'Invalid token prefix',
            })
        }

        const tokenWithoutBearer = token.slice(7)
        const decoded = verifyToken(tokenWithoutBearer) 

        if (decoded instanceof trpc.TRPCError) {
            throw decoded
        }

        if (decoded.role !== Role.ADMIN) {
            throw new trpc.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'User is not an admin',
            })
        }

        return next()
    })
    .mutation('promote', {
        input: z.string(),
        output: z.object({
            name: z.string(),
            role: z.string()
        }),
        async resolve({ ctx, input }) {
            const user = await ctx.prisma.user.update({
                where: {
                    name: input,
                },
                data: {
                    role: Role.ADMIN,
                }
            })
            
            if (!user) {
                throw new trpc.TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'User not found',
                })
            }

            return { name: user.name, role: user.role }
        }
    })
    .mutation('demote', {
        input: z.string(),
        output: z.object({
            name: z.string(),
            role: z.string()
        }),
        async resolve({ ctx, input }) {
            const user = await ctx.prisma.user.update({
                where: {
                    name: input,
                },
                data: {
                    role: Role.USER,
                }
            })
            
            if (!user) {
                throw new trpc.TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'User not found',
                })
            }

            if (user.role === Role.ADMIN) {
                throw new trpc.TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'User already is admin',
                })
            }
            
            return { name: user.name, role: user.role }
        }
    })
    .mutation('delete', {
        input: z.string(),
        output: z.void(),
        resolve() {
            return 
        }
    })
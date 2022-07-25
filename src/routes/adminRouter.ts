import { Role } from '@prisma/client'
import * as trpc from '@trpc/server'
import { z } from 'zod'
import type { Context } from '../server'

export const adminRouter = trpc.
    router<Context>()
    .middleware(async ({ ctx, next }) => {
        if (!ctx.user) {
            throw new trpc.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'You must be logged in to access this resource', 
            })
        }

        if (ctx.user.role !== Role.ADMIN) {
            throw new trpc.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'You must be an admin to access this resource',
            })
        }

        return next()
    })
    .mutation('promote', {
        input: z.object({
            name: z.string().min(3).max(16),
        }),
        output: z.object({
            name: z.string(),
            role: z.string()
        }),
        async resolve({ ctx, input }) {
            const user = await ctx.prisma.user.update({
                where: {
                    name: input.name,
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
        input: z.object({
            name: z.string().min(3).max(16),
        }),
        output: z.object({
            name: z.string(),
            role: z.string()
        }),
        async resolve({ ctx, input }) {
            const user = await ctx.prisma.user.update({
                where: {
                    name: input.name,
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
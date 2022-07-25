import * as trpc from '@trpc/server'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createToken } from '../jwt'
import type { Context } from '../server'

export const authRouter = trpc.
    router<Context>()
    .query('login', {
        input: z.object({
            name: z.string(),
            password: z.string() 
        }),
        output: z.string(),
        async resolve({ ctx, input }) {
            const user = await ctx.prisma.user.findFirst({
                where: {
                    name: input.name,
                }
            })

            if (!user) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'User not found',
                })
            }

            if (user.password !== input.password) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Wrong password',
                })
            }

            return createToken(user)
        } 
    })
    .mutation('register', {
        input: z.object({
            name: z.string(),
            email: z.string(),
            password: z.string()
        }),
        output: z.string(),
        async resolve({ ctx, input }) {
            const user = await ctx.prisma.user.create({
                data: {
                    name: input.name,
                    email: input.email,
                    // TODO: hash password
                    password: input.password,
                }
            })

            return createToken(user) 
        }
    })

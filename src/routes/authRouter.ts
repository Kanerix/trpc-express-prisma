import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import * as trpc from '@trpc/server'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createToken } from '../jwt'
import type { Context } from '../server'

export const authRouter = trpc.
    router<Context>()
    .mutation('login', {
        input: z.object({
            name: z.string().min(3).max(16),
            password: z.string().min(6).max(64) 
        }),
        output: z.string(),
        async resolve({ ctx, input }) {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    name: input.name,
                }
            })

            if (!user) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'User not found',
                })
            }

            if (user.password !== input.password) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Wrong password',
                })
            }

            return createToken(user)
        } 
    })
    .mutation('register', {
        input: z.object({
            name: z.string().min(3).max(16),
            email: z.string(),
            password: z.string().min(6).max(64)
        }),
        output: z.string(),
        async resolve({ ctx, input }) {
            try {
                const user = await ctx.prisma.user.create({
                    data: {
                        name: input.name,
                        email: input.email,
                        // TODO: hash password
                        password: input.password,
                    }
                })
                
                return createToken(user) 
            } catch (error) {
                if (error instanceof PrismaClientKnownRequestError) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'User already exists',
                    })
                }

                throw new trpc.TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Unkown error',
                }) 
            }
        }
    })

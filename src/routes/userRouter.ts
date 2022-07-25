import { Role } from '@prisma/client'
import * as trpc from '@trpc/server'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import type { Context } from '../server'

export const userRouter = trpc
    .router<Context>()
    .middleware(async ({ ctx, next }) => {
        if (!ctx.user) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'You must be logged in to access this resource', 
            })
        }
        
        return next()
    })
    .query('posts', {
        input: z.void(),
        output: z.array(
            z.object({
                id: z.number(),
                title: z.string(),
                content: z.string(),
                author: z.object({
                    id: z.string(),
                    name: z.string(),
                })
            })
        ),
        async resolve({ ctx }) {
            return await ctx.prisma.post.findMany({
                select: {
                    id: true,
                    title: true,
                    content: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            })
        }
    })
    .mutation('createPost', {
        meta: { role: Role.USER },
        input: z.object({
            title: z.string().max(128),
            content: z.string().max(1024),
        }),
        output: z.object({
            id: z.number(),
            title: z.string().max(128),
            content: z.string().max(1024),
        }),
        async resolve({ ctx, input }) {
            if (!ctx.user) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be logged in to access this resource', 
                })
            }

            const post = await ctx.prisma.post.create({
                data: {
                    title: input.title,
                    content: input.content,
                    author: {
                        connect: {
                            name: ctx.user.name,
                        },
                    }
                }
            })

            return {
                id: post.id,
                title: post.title,
                content: post.content,
            }
        }
    })
    .mutation('deletePost', {
        meta: { role: Role.USER },
        input: z.object({
            id: z.number(),
        }),
        output: z.void(),
        async resolve({ ctx, input }) {
            try {
                if (!ctx.user) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'You must be logged in to access this resource',
                    })
                }

                ctx.prisma.post.updateMany({
                    where: {
                        id: input.id,
                        author: {
                            id: ctx.user.id,
                        }
                    },
                    data: {
                        deletedAt: new Date(),
                    }
                })
            } catch (e) {
                console.log(e)
            }

            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Unkown error',
            })
        }
    })
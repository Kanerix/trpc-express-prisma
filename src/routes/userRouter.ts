import { Role } from '@prisma/client'
import * as trpc from '@trpc/server'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import type { Context } from '../server'

export const userRouter = trpc
    .router<Context>()
    .query('posts', {
        input: z.void(),
        output: z.array(
            z.object({
                id: z.number(),
                title: z.string().max(128),
                content: z.string().max(1024),
                author: z.object({
                    id: z.string(),
                    name: z.string(),
                })
            })
        ),
        async resolve({ ctx }) {
            return await ctx.prisma.post.findMany({
                where: {
                    deletedAt: null,
                },
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
        output: z.object({
            id: z.number(),
            title: z.string().max(128),
            content: z.string().max(1024),
            deletedAt: z.date().nullable(),
            author: z.object({
                id: z.string(),
                name: z.string().max(16),
            })
        }),
        async resolve({ ctx, input }) {
            if (!ctx.user) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be logged in to access this resource',
                })
            }

            const post = await ctx.prisma.post.findUnique({
                where: {
                    id: input.id,
                }
            })

            if (!post) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Post not found',
                })
            }

            if (post.authorId !== ctx.user.id) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be the author to delete this post',
                })
            }

            try {
                const updatedPost = await ctx.prisma.post.update({
                    where: {
                        id: post.id,
                    },
                    data: {
                        deletedAt: new Date()
                    },
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        deletedAt: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                })

                return updatedPost
            } catch (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Could not delete post',
                })
            }

        }
    })
import jwt from 'jsonwebtoken'
import type { Role, User } from '@prisma/client'
import { TRPCError } from '@trpc/server'

export interface Token {
    name: string
    role: Role
    exp: number
}

export function createToken(user: User): string {
    const payload: Token = {
        name: user.name,
        role: user.role,
        // Token expires in 1 minute
        exp: Math.floor(Date.now() / 1000) + (60),
    }

    const token = jwt.sign(payload, 'secret')

    return token
}

export function verifyToken(token: string): TRPCError | Token {
    try {
        const decoded = jwt.verify(token, 'secret') as Token

        return decoded
    } catch (error) {
        if (error instanceof Error) {
            return new TRPCError({
                code: 'UNAUTHORIZED',
                message: error.message,
            })
        }

        return new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Unkown error',
        })
    }
} 
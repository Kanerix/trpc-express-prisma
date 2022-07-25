import jwt, { JsonWebTokenError } from 'jsonwebtoken'
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
        // Token expires in 5 minute
        exp: (Math.floor(Date.now() / 1000) + 60 * 5),
    }

    const token = jwt.sign(payload, 'secret')

    return token
}

export function verifyToken(token: string): TRPCError | Token {
    try {
        return jwt.verify(token, 'secret') as Token
    } catch (error) {
        console.log(error)
        console.log(token)
        if (error instanceof JsonWebTokenError) {
            return new TRPCError({
                code: 'UNAUTHORIZED',
                message: error.message,
            })
        }

        return new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unkown error',
        })
    }
} 
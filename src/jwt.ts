import jwt from 'jsonwebtoken'
import type { Role, User } from '@prisma/client'

export interface Payload {
    id: string 
    name: string
    role: Role
    exp: number
}

export function createToken(user: User): string {
    const payload: Payload = {
        id: user.id,
        name: user.name,
        role: user.role,
        exp: (Math.floor(Date.now() / 1000) + 60 * 5),
    }

    const token = jwt.sign(payload, 'secret')

    return token
}

export function verifyToken(token: string): Payload | undefined {
    try {
        return (jwt.verify(token, 'secret') as Payload)
    } catch (error) {
        return
    }
} 
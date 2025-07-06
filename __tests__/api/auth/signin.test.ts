import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/signin/route'
import { db } from '@/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Mock dependencies
jest.mock('@/db')
jest.mock('bcryptjs')
jest.mock('jsonwebtoken')

const mockDb = db as jest.Mocked<typeof db>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const mockJwt = jwt as jest.Mocked<typeof jwt>

describe('POST /api/auth/signin', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should successfully sign in user with valid credentials', async () => {
        const mockUser = {
            userId: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashed-password',
            isAdmin: false,
            isPremium: false,
        }

        mockDb.query.users.findFirst.mockResolvedValue(mockUser)
        mockBcrypt.compare.mockResolvedValue(true as any)
        mockJwt.sign.mockReturnValue('test-jwt-token')

        const request = new NextRequest('http://localhost:3001/api/auth/signin', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.user).toEqual({
            userId: mockUser.userId,
            email: mockUser.email,
            name: mockUser.name,
            isAdmin: mockUser.isAdmin,
            isPremium: mockUser.isPremium,
        })
        expect(data.token).toBe('test-jwt-token')

        expect(mockDb.query.users.findFirst).toHaveBeenCalledWith({
            where: (users: any, { eq }: any) => eq(users.email, 'test@example.com'),
        })
        expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password')
        expect(mockJwt.sign).toHaveBeenCalledWith(
            {
                userId: mockUser.userId,
                email: mockUser.email,
                name: mockUser.name,
                isAdmin: mockUser.isAdmin,
                isPremium: mockUser.isPremium,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )
    })

    it('should return error for non-existent user', async () => {
        mockDb.query.users.findFirst.mockResolvedValue(null)

        const request = new NextRequest('http://localhost:3001/api/auth/signin', {
            method: 'POST',
            body: JSON.stringify({
                email: 'nonexistent@example.com',
                password: 'password123',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Email ou mot de passe incorrect')

        expect(mockDb.query.users.findFirst).toHaveBeenCalledWith({
            where: (users: any, { eq }: any) => eq(users.email, 'nonexistent@example.com'),
        })
        expect(mockBcrypt.compare).not.toHaveBeenCalled()
        expect(mockJwt.sign).not.toHaveBeenCalled()
    })

    it('should return error for incorrect password', async () => {
        const mockUser = {
            userId: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashed-password',
            isAdmin: false,
            isPremium: false,
        }

        mockDb.query.users.findFirst.mockResolvedValue(mockUser)
        mockBcrypt.compare.mockResolvedValue(false as any)

        const request = new NextRequest('http://localhost:3001/api/auth/signin', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'wrongpassword',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Email ou mot de passe incorrect')

        expect(mockBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed-password')
        expect(mockJwt.sign).not.toHaveBeenCalled()
    })

    it('should return error for invalid request body', async () => {
        const request = new NextRequest('http://localhost:3001/api/auth/signin', {
            method: 'POST',
            body: 'invalid-json',
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Données de requête invalides')
    })

    it('should return error for missing email', async () => {
        const request = new NextRequest('http://localhost:3001/api/auth/signin', {
            method: 'POST',
            body: JSON.stringify({
                password: 'password123',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Email et mot de passe requis')
    })

    it('should return error for missing password', async () => {
        const request = new NextRequest('http://localhost:3001/api/auth/signin', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Email et mot de passe requis')
    })

    it('should handle database error', async () => {
        mockDb.query.users.findFirst.mockRejectedValue(new Error('Database error'))

        const request = new NextRequest('http://localhost:3001/api/auth/signin', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Erreur interne du serveur')
    })

    it('should handle bcrypt error', async () => {
        const mockUser = {
            userId: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashed-password',
            isAdmin: false,
            isPremium: false,
        }

        mockDb.query.users.findFirst.mockResolvedValue(mockUser)
        mockBcrypt.compare.mockRejectedValue(new Error('Bcrypt error'))

        const request = new NextRequest('http://localhost:3001/api/auth/signin', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Erreur interne du serveur')
    })

    it('should handle JWT signing error', async () => {
        const mockUser = {
            userId: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashed-password',
            isAdmin: false,
            isPremium: false,
        }

        mockDb.query.users.findFirst.mockResolvedValue(mockUser)
        mockBcrypt.compare.mockResolvedValue(true as any)
        mockJwt.sign.mockImplementation(() => {
            throw new Error('JWT signing error')
        })

        const request = new NextRequest('http://localhost:3001/api/auth/signin', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Erreur interne du serveur')
    })
}) 
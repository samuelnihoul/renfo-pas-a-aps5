import { NextRequest } from 'next/server'
import { POST } from '@/app/api/programs/access/route'
import { db } from '@/db'
import { getAuthenticatedUser } from '@/lib/auth-middleware'

// Mock dependencies
jest.mock('@/db', () => ({
    db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
    },
}))

jest.mock('@/lib/auth-middleware', () => ({
    getAuthenticatedUser: jest.fn(),
}))

const mockDb = db as jest.Mocked<typeof db>
const mockGetAuthenticatedUser = getAuthenticatedUser as jest.MockedFunction<typeof getAuthenticatedUser>

describe('POST /api/programs/access', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should grant access for purchased program', async () => {
        const mockUser = {
            userId: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            isAdmin: false,
            isPremium: false,
        }

        const mockPurchase = [{
            userId: 'test-user-id',
            programId: 2,
            purchasedAt: new Date(),
        }]

        mockGetAuthenticatedUser.mockResolvedValue(mockUser)
            ; (mockDb.where as jest.Mock).mockResolvedValue(mockPurchase)

        const request = new NextRequest('http://localhost:3001/api/programs/access', {
            method: 'POST',
            body: JSON.stringify({ programId: 2 }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.hasAccess).toBe(true)
        expect(data.reason).toBe('purchased')
    })

    it('should grant free trial access for program 1, days 1-14', async () => {
        const mockUser = {
            userId: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            isAdmin: false,
            isPremium: false,
        }

        mockGetAuthenticatedUser.mockResolvedValue(mockUser)
            ; (mockDb.where as jest.Mock).mockResolvedValue([])

        const request = new NextRequest('http://localhost:3001/api/programs/access', {
            method: 'POST',
            body: JSON.stringify({ programId: 1, dayNumber: 7 }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.hasAccess).toBe(true)
        expect(data.reason).toBe('free_trial')
    })

    it('should deny access for program 1 after day 14', async () => {
        const mockUser = {
            userId: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            isAdmin: false,
            isPremium: false,
        }

        mockGetAuthenticatedUser.mockResolvedValue(mockUser)
            ; (mockDb.where as jest.Mock).mockResolvedValue([])

        const request = new NextRequest('http://localhost:3001/api/programs/access', {
            method: 'POST',
            body: JSON.stringify({ programId: 1, dayNumber: 15 }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.hasAccess).toBe(false)
        expect(data.reason).toBe('not_purchased')
    })

    it('should deny access for non-purchased program', async () => {
        const mockUser = {
            userId: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            isAdmin: false,
            isPremium: false,
        }

        mockGetAuthenticatedUser.mockResolvedValue(mockUser)
            ; (mockDb.where as jest.Mock).mockResolvedValue([])

        const request = new NextRequest('http://localhost:3001/api/programs/access', {
            method: 'POST',
            body: JSON.stringify({ programId: 3 }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.hasAccess).toBe(false)
        expect(data.reason).toBe('not_purchased')
    })

    it('should return error for unauthenticated user', async () => {
        mockGetAuthenticatedUser.mockResolvedValue(null)

        const request = new NextRequest('http://localhost:3001/api/programs/access', {
            method: 'POST',
            body: JSON.stringify({ programId: 1 }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Non authentifié')
    })

    it('should return error for missing programId', async () => {
        const mockUser = {
            userId: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            isAdmin: false,
            isPremium: false,
        }

        mockGetAuthenticatedUser.mockResolvedValue(mockUser)

        const request = new NextRequest('http://localhost:3001/api/programs/access', {
            method: 'POST',
            body: JSON.stringify({}),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('programId est requis')
    })

    it('should handle database error', async () => {
        const mockUser = {
            userId: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            isAdmin: false,
            isPremium: false,
        }

        mockGetAuthenticatedUser.mockResolvedValue(mockUser)
            ; (mockDb.where as jest.Mock).mockRejectedValue(new Error('Database error'))

        const request = new NextRequest('http://localhost:3001/api/programs/access', {
            method: 'POST',
            body: JSON.stringify({ programId: 1 }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Erreur lors de la vérification d\'accès')
    })
}) 
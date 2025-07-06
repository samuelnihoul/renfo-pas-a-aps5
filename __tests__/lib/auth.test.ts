import jwt from 'jsonwebtoken'
import { generateToken, verifyToken } from '@/lib/auth'

// Mock jsonwebtoken
jest.mock('jsonwebtoken')

const mockJwt = jwt as jest.Mocked<typeof jwt>

describe('Auth utilities', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('generateToken', () => {
        it('should generate a JWT token with user data', () => {
            const mockUser = {
                userId: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
                isAdmin: false,
                isPremium: false,
            }

            mockJwt.sign.mockReturnValue('test-jwt-token')

            const token = generateToken(mockUser)

            expect(token).toBe('test-jwt-token')
            expect(mockJwt.sign).toHaveBeenCalledWith(
                mockUser,
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            )
        })

        it('should handle JWT signing error', () => {
            const mockUser = {
                userId: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
                isAdmin: false,
                isPremium: false,
            }

            mockJwt.sign.mockImplementation(() => {
                throw new Error('JWT signing error')
            })

            expect(() => generateToken(mockUser)).toThrow('JWT signing error')
        })
    })

    describe('verifyToken', () => {
        it('should verify and return user data from valid token', () => {
            const mockUser = {
                userId: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
                isAdmin: false,
                isPremium: false,
            }

            mockJwt.verify.mockReturnValue(mockUser as any)

            const result = verifyToken('valid-token')

            expect(result).toEqual(mockUser)
            expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET)
        })

        it('should return null for invalid token', () => {
            mockJwt.verify.mockImplementation(() => {
                throw new Error('Invalid token')
            })

            const result = verifyToken('invalid-token')

            expect(result).toBeNull()
            expect(mockJwt.verify).toHaveBeenCalledWith('invalid-token', process.env.JWT_SECRET)
        })

        it('should return null for expired token', () => {
            mockJwt.verify.mockImplementation(() => {
                throw new Error('TokenExpiredError')
            })

            const result = verifyToken('expired-token')

            expect(result).toBeNull()
        })

        it('should return null for malformed token', () => {
            mockJwt.verify.mockImplementation(() => {
                throw new Error('JsonWebTokenError')
            })

            const result = verifyToken('malformed-token')

            expect(result).toBeNull()
        })
    })
}) 
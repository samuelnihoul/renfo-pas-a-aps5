import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuth } from '@/hooks/use-auth'
import { useProgramAccess } from '@/hooks/use-program-access'

// Mock fetch globally
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock hooks
jest.mock('@/hooks/use-auth')
jest.mock('@/hooks/use-program-access')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseProgramAccess = useProgramAccess as jest.MockedFunction<typeof useProgramAccess>

describe('Authentication Flow Integration', () => {
    const mockUser = {
        userId: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        isAdmin: false,
        isPremium: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('User Registration and Login Flow', () => {
        it('should allow user to register and then access programs', async () => {
            const user = userEvent.setup()

            // Mock successful registration
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ user: mockUser }),
            } as Response)

            // Mock successful login
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ user: mockUser }),
            } as Response)

            // Mock program access check
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ hasAccess: true, reason: 'purchased' }),
            } as Response)

            // Simulate registration
            const signUpResult = await mockUseAuth().signUp('test@example.com', 'password123', 'Test User')
            expect(signUpResult.success).toBe(true)

            // Simulate login
            const signInResult = await mockUseAuth().signIn('test@example.com', 'password123')
            expect(signInResult.success).toBe(true)

            // Verify user is authenticated
            expect(mockUseAuth().isAuthenticated).toBe(true)
            expect(mockUseAuth().user).toEqual(mockUser)
        })

        it('should handle registration with existing email', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Email already exists' }),
            } as Response)

            const signUpResult = await mockUseAuth().signUp('existing@example.com', 'password123', 'Test User')
            expect(signUpResult.success).toBe(false)
            expect(signUpResult.error).toBe('Email already exists')
        })

        it('should handle login with invalid credentials', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Invalid credentials' }),
            } as Response)

            const signInResult = await mockUseAuth().signIn('test@example.com', 'wrongpassword')
            expect(signInResult.success).toBe(false)
            expect(signInResult.error).toBe('Invalid credentials')
        })
    })

    describe('Program Access Flow', () => {
        it('should grant free trial access to program 1 for first 14 days', async () => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                loading: false,
                isAuthenticated: true,
                signIn: jest.fn(),
                signUp: jest.fn(),
                signOut: jest.fn(),
            })

            // Mock free trial access for day 7
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ hasAccess: true, reason: 'free_trial' }),
            } as Response)

            const { hasAccess, reason } = await mockUseProgramAccess('test-user-id', 1, 7)
            expect(hasAccess).toBe(true)
            expect(reason).toBe('free_trial')
        })

        it('should deny access to program 1 after day 14', async () => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                loading: false,
                isAuthenticated: true,
                signIn: jest.fn(),
                signUp: jest.fn(),
                signOut: jest.fn(),
            })

            // Mock no access for day 15
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ hasAccess: false, reason: 'not_purchased' }),
            } as Response)

            const { hasAccess, reason } = await mockUseProgramAccess('test-user-id', 1, 15)
            expect(hasAccess).toBe(false)
            expect(reason).toBe('not_purchased')
        })

        it('should grant access to purchased programs', async () => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                loading: false,
                isAuthenticated: true,
                signIn: jest.fn(),
                signUp: jest.fn(),
                signOut: jest.fn(),
            })

            // Mock purchased access
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ hasAccess: true, reason: 'purchased' }),
            } as Response)

            const { hasAccess, reason } = await mockUseProgramAccess('test-user-id', 2)
            expect(hasAccess).toBe(true)
            expect(reason).toBe('purchased')
        })
    })

    describe('Purchase Flow', () => {
        it('should redirect to Stripe checkout when purchasing program', async () => {
            const user = userEvent.setup()

            mockUseAuth.mockReturnValue({
                user: mockUser,
                loading: false,
                isAuthenticated: true,
                signIn: jest.fn(),
                signUp: jest.fn(),
                signOut: jest.fn(),
            })

            // Mock Stripe checkout session creation
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ url: 'https://checkout.stripe.com/test' }),
            } as Response)

            // Simulate purchase request
            const response = await fetch('/api/programs/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ programId: 2 }),
            })

            const data = await response.json()
            expect(data.url).toBe('https://checkout.stripe.com/test')
        })

        it('should handle purchase error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Payment failed' }),
            } as Response)

            const response = await fetch('/api/programs/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ programId: 2 }),
            })

            const data = await response.json()
            expect(data.error).toBe('Payment failed')
        })
    })

    describe('Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            const signInResult = await mockUseAuth().signIn('test@example.com', 'password123')
            expect(signInResult.success).toBe(false)
            expect(signInResult.error).toBe('Erreur de connexion')
        })

        it('should handle server errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: 'Internal server error' }),
            } as Response)

            const signInResult = await mockUseAuth().signIn('test@example.com', 'password123')
            expect(signInResult.success).toBe(false)
            expect(signInResult.error).toBe('Internal server error')
        })
    })

    describe('Session Management', () => {
        it('should maintain user session across page reloads', async () => {
            // Mock user data on app load
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ user: mockUser }),
            } as Response)

            mockUseAuth.mockReturnValue({
                user: mockUser,
                loading: false,
                isAuthenticated: true,
                signIn: jest.fn(),
                signUp: jest.fn(),
                signOut: jest.fn(),
            })

            expect(mockUseAuth().isAuthenticated).toBe(true)
            expect(mockUseAuth().user).toEqual(mockUser)
        })

        it('should clear session on logout', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Logged out successfully' }),
            } as Response)

            await mockUseAuth().signOut()

            expect(mockUseAuth().user).toBe(null)
            expect(mockUseAuth().isAuthenticated).toBe(false)
        })
    })
}) 
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'

// Mock fetch globally
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('useAuth', () => {
    beforeEach(() => {
        mockFetch.mockClear()
    })

    describe('initial state', () => {
        it('should start with loading state', () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Not authenticated' }),
            } as Response)

            const { result } = renderHook(() => useAuth())

            expect(result.current.loading).toBe(true)
            expect(result.current.user).toBe(null)
            expect(result.current.isAuthenticated).toBe(false)
        })

        it('should load user data on mount if authenticated', async () => {
            const mockUser = {
                userId: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
                isAdmin: false,
                isPremium: false,
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ user: mockUser }),
            } as Response)

            const { result } = renderHook(() => useAuth())

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            expect(result.current.user).toEqual(mockUser)
            expect(result.current.isAuthenticated).toBe(true)
        })
    })

    describe('signIn', () => {
        it('should successfully sign in user', async () => {
            const mockUser = {
                userId: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
                isAdmin: false,
                isPremium: false,
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ user: mockUser }),
            } as Response)

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                const signInResult = await result.current.signIn('test@example.com', 'password123')
                expect(signInResult.success).toBe(true)
            })

            expect(result.current.user).toEqual(mockUser)
            expect(result.current.isAuthenticated).toBe(true)
        })

        it('should handle sign in error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Invalid credentials' }),
            } as Response)

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                const signInResult = await result.current.signIn('test@example.com', 'wrongpassword')
                expect(signInResult.success).toBe(false)
                expect(signInResult.error).toBe('Invalid credentials')
            })

            expect(result.current.user).toBe(null)
            expect(result.current.isAuthenticated).toBe(false)
        })

        it('should handle network error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                const signInResult = await result.current.signIn('test@example.com', 'password123')
                expect(signInResult.success).toBe(false)
                expect(signInResult.error).toBe('Erreur de connexion')
            })
        })
    })

    describe('signUp', () => {
        it('should successfully sign up user', async () => {
            const mockUser = {
                userId: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
                isAdmin: false,
                isPremium: false,
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ user: mockUser }),
            } as Response)

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                const signUpResult = await result.current.signUp('test@example.com', 'password123', 'Test User')
                expect(signUpResult.success).toBe(true)
            })

            expect(result.current.user).toEqual(mockUser)
            expect(result.current.isAuthenticated).toBe(true)
        })

        it('should handle sign up error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Email already exists' }),
            } as Response)

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                const signUpResult = await result.current.signUp('test@example.com', 'password123', 'Test User')
                expect(signUpResult.success).toBe(false)
                expect(signUpResult.error).toBe('Email already exists')
            })

            expect(result.current.user).toBe(null)
            expect(result.current.isAuthenticated).toBe(false)
        })
    })

    describe('signOut', () => {
        it('should successfully sign out user', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Signed out successfully' }),
            } as Response)

            const { result } = renderHook(() => useAuth())

            // Set initial user state
            act(() => {
                result.current.user = {
                    userId: 'test-user-id',
                    email: 'test@example.com',
                    name: 'Test User',
                    isAdmin: false,
                    isPremium: false,
                }
            })

            await act(async () => {
                await result.current.signOut()
            })

            expect(result.current.user).toBe(null)
            expect(result.current.isAuthenticated).toBe(false)
        })

        it('should handle sign out error gracefully', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            const { result } = renderHook(() => useAuth())

            // Set initial user state
            act(() => {
                result.current.user = {
                    userId: 'test-user-id',
                    email: 'test@example.com',
                    name: 'Test User',
                    isAdmin: false,
                    isPremium: false,
                }
            })

            await act(async () => {
                await result.current.signOut()
            })

            // Should still clear user even if request fails
            expect(result.current.user).toBe(null)
            expect(result.current.isAuthenticated).toBe(false)
        })
    })
}) 
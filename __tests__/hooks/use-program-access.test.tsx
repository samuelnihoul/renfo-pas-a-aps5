import { renderHook, act, waitFor } from '@testing-library/react'
import { useProgramAccess } from '@/hooks/use-program-access'

// Mock fetch globally
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('useProgramAccess', () => {
    beforeEach(() => {
        mockFetch.mockClear()
    })

    describe('initial state', () => {
        it('should start with loading state', () => {
            const { result } = renderHook(() => useProgramAccess('test-user-id', 1))

            expect(result.current.loading).toBe(true)
            expect(result.current.hasAccess).toBe(false)
            expect(result.current.error).toBeUndefined()
        })
    })

    describe('program access logic', () => {
        it('should grant access for purchased program', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ hasAccess: true, reason: 'purchased' }),
            } as Response)

            const { result } = renderHook(() => useProgramAccess('test-user-id', 2))

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            expect(result.current.hasAccess).toBe(true)
            expect(result.current.reason).toBe('purchased')
            expect(result.current.error).toBeUndefined()
        })

        it('should grant free trial access for program 1, days 1-14', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ hasAccess: true, reason: 'free_trial' }),
            } as Response)

            const { result } = renderHook(() => useProgramAccess('test-user-id', 1, 7))

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            expect(result.current.hasAccess).toBe(true)
            expect(result.current.reason).toBe('free_trial')
        })

        it('should deny access for non-purchased program', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ hasAccess: false, reason: 'not_purchased' }),
            } as Response)

            const { result } = renderHook(() => useProgramAccess('test-user-id', 3))

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            expect(result.current.hasAccess).toBe(false)
            expect(result.current.reason).toBe('not_purchased')
        })

        it('should handle API error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Server error' }),
            } as Response)

            const { result } = renderHook(() => useProgramAccess('test-user-id', 1))

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            expect(result.current.hasAccess).toBe(false)
            expect(result.current.error).toBe('Erreur lors de la vérification d\'accès')
        })

        it('should handle network error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            const { result } = renderHook(() => useProgramAccess('test-user-id', 1))

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            expect(result.current.hasAccess).toBe(false)
            expect(result.current.error).toBe('Erreur inconnue')
        })
    })

    describe('re-fetching on parameter changes', () => {
        it('should re-fetch when userId changes', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ hasAccess: true, reason: 'purchased' }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ hasAccess: false, reason: 'not_purchased' }),
                } as Response)

            const { result, rerender } = renderHook(
                ({ userId, programId }) => useProgramAccess(userId, programId),
                { initialProps: { userId: 'user-1', programId: 1 } }
            )

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            expect(result.current.hasAccess).toBe(true)

            // Change userId
            rerender({ userId: 'user-2', programId: 1 })

            await waitFor(() => {
                expect(result.current.hasAccess).toBe(false)
            })

            expect(mockFetch).toHaveBeenCalledTimes(2)
        })

        it('should re-fetch when programId changes', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ hasAccess: true, reason: 'purchased' }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ hasAccess: false, reason: 'not_purchased' }),
                } as Response)

            const { result, rerender } = renderHook(
                ({ userId, programId }) => useProgramAccess(userId, programId),
                { initialProps: { userId: 'user-1', programId: 1 } }
            )

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            expect(result.current.hasAccess).toBe(true)

            // Change programId
            rerender({ userId: 'user-1', programId: 2 })

            await waitFor(() => {
                expect(result.current.hasAccess).toBe(false)
            })

            expect(mockFetch).toHaveBeenCalledTimes(2)
        })

        it('should re-fetch when dayNumber changes', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ hasAccess: true, reason: 'free_trial' }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ hasAccess: false, reason: 'not_purchased' }),
                } as Response)

            const { result, rerender } = renderHook(
                ({ userId, programId, dayNumber }) => useProgramAccess(userId, programId, dayNumber),
                { initialProps: { userId: 'user-1', programId: 1, dayNumber: 7 } }
            )

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            expect(result.current.hasAccess).toBe(true)

            // Change dayNumber
            rerender({ userId: 'user-1', programId: 1, dayNumber: 15 })

            await waitFor(() => {
                expect(result.current.hasAccess).toBe(false)
            })

            expect(mockFetch).toHaveBeenCalledTimes(2)
        })
    })

    describe('edge cases', () => {
        it('should not fetch if userId is empty', () => {
            const { result } = renderHook(() => useProgramAccess('', 1))

            expect(result.current.loading).toBe(true)
            expect(mockFetch).not.toHaveBeenCalled()
        })

        it('should not fetch if programId is invalid', () => {
            const { result } = renderHook(() => useProgramAccess('test-user-id', 0))

            expect(result.current.loading).toBe(true)
            expect(mockFetch).not.toHaveBeenCalled()
        })
    })
}) 
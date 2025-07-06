import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProgramCard } from '@/components/program-card'

// Mock fetch globally
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock window.location
Object.defineProperty(window, 'location', {
    value: {
        href: '',
    },
    writable: true,
})

describe('ProgramCard', () => {
    const mockProgram = {
        id: 1,
        name: 'Programme Test',
        material: 'Haltères, tapis',
    }

    beforeEach(() => {
        mockFetch.mockClear()
        window.location.href = ''
    })

    describe('rendering', () => {
        it('should render program information correctly', () => {
            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={false}
                    accessReason="not_purchased"
                />
            )

            expect(screen.getByText('Programme Test')).toBeInTheDocument()
            expect(screen.getByText('Matériel requis : Haltères, tapis')).toBeInTheDocument()
        })

        it('should show purchased badge when program is purchased', () => {
            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={true}
                    accessReason="purchased"
                />
            )

            expect(screen.getByText('Acheté')).toBeInTheDocument()
        })

        it('should show free trial badge for program 1', () => {
            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={true}
                    accessReason="free_trial"
                />
            )

            expect(screen.getByText('Essai gratuit')).toBeInTheDocument()
        })

        it('should show not purchased badge when no access', () => {
            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={false}
                    accessReason="not_purchased"
                />
            )

            expect(screen.getByText('Non acheté')).toBeInTheDocument()
        })
    })

    describe('action buttons', () => {
        it('should show "Commencer" button when user has access', () => {
            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={true}
                    accessReason="purchased"
                />
            )

            expect(screen.getByText('Commencer')).toBeInTheDocument()
            expect(screen.queryByText('Acheter')).not.toBeInTheDocument()
        })

        it('should show purchase button for non-purchased programs', () => {
            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={false}
                    accessReason="not_purchased"
                />
            )

            expect(screen.getByText('Acheter')).toBeInTheDocument()
            expect(screen.queryByText('Commencer')).not.toBeInTheDocument()
        })

        it('should show both free trial and purchase buttons for program 1', () => {
            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={false}
                    accessReason="not_purchased"
                />
            )

            expect(screen.getByText('Essayer gratuitement (2 semaines)')).toBeInTheDocument()
            expect(screen.getByText('Acheter le programme complet')).toBeInTheDocument()
        })
    })

    describe('purchase functionality', () => {
        it('should redirect to Stripe checkout when purchase button is clicked', async () => {
            const user = userEvent.setup()

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ url: 'https://checkout.stripe.com/test' }),
            } as Response)

            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={false}
                    accessReason="not_purchased"
                />
            )

            const purchaseButton = screen.getByText('Acheter')
            await user.click(purchaseButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/programs/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ programId: 1 }),
                })
            })

            await waitFor(() => {
                expect(window.location.href).toBe('https://checkout.stripe.com/test')
            })
        })

        it('should show loading state during purchase', async () => {
            const user = userEvent.setup()

            // Mock a delayed response
            mockFetch.mockImplementationOnce(
                () => new Promise(resolve => setTimeout(() => resolve({
                    ok: true,
                    json: async () => ({ url: 'https://checkout.stripe.com/test' }),
                } as Response), 100))
            )

            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={false}
                    accessReason="not_purchased"
                />
            )

            const purchaseButton = screen.getByText('Acheter')
            await user.click(purchaseButton)

            expect(screen.getByText('Achat en cours...')).toBeInTheDocument()
            expect(purchaseButton).toBeDisabled()
        })

        it('should handle purchase error', async () => {
            const user = userEvent.setup()

            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Payment failed' }),
            } as Response)

            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={false}
                    accessReason="not_purchased"
                />
            )

            const purchaseButton = screen.getByText('Acheter')
            await user.click(purchaseButton)

            await waitFor(() => {
                expect(screen.getByText('Acheter')).toBeInTheDocument() // Button should be re-enabled
            })
        })

        it('should handle network error during purchase', async () => {
            const user = userEvent.setup()

            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={false}
                    accessReason="not_purchased"
                />
            )

            const purchaseButton = screen.getByText('Acheter')
            await user.click(purchaseButton)

            await waitFor(() => {
                expect(screen.getByText('Acheter')).toBeInTheDocument() // Button should be re-enabled
            })
        })
    })

    describe('free trial functionality', () => {
        it('should show free trial message for program 1', () => {
            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={false}
                    accessReason="not_purchased"
                />
            )

            expect(screen.getByText('Les deux premières semaines sont gratuites pour tous les utilisateurs !')).toBeInTheDocument()
        })

        it('should not show free trial message for other programs', () => {
            const otherProgram = { ...mockProgram, id: 2 }

            render(
                <ProgramCard
                    program={otherProgram}
                    userId="test-user-id"
                    hasAccess={false}
                    accessReason="not_purchased"
                />
            )

            expect(screen.queryByText('Les deux premières semaines sont gratuites pour tous les utilisateurs !')).not.toBeInTheDocument()
        })
    })

    describe('accessibility', () => {
        it('should have proper ARIA labels', () => {
            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={false}
                    accessReason="not_purchased"
                />
            )

            const purchaseButton = screen.getByText('Acheter')
            expect(purchaseButton).toBeInTheDocument()
        })

        it('should disable button during loading', async () => {
            const user = userEvent.setup()

            mockFetch.mockImplementationOnce(
                () => new Promise(resolve => setTimeout(() => resolve({
                    ok: true,
                    json: async () => ({ url: 'https://checkout.stripe.com/test' }),
                } as Response), 100))
            )

            render(
                <ProgramCard
                    program={mockProgram}
                    userId="test-user-id"
                    hasAccess={false}
                    accessReason="not_purchased"
                />
            )

            const purchaseButton = screen.getByText('Acheter')
            await user.click(purchaseButton)

            expect(purchaseButton).toBeDisabled()
        })
    })
}) 
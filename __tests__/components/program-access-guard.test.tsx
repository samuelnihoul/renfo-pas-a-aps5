import { render, screen, waitFor } from '@testing-library/react'
import { ProgramAccessGuard } from '@/components/program-access-guard'
import { useAuth } from '@/hooks/use-auth'
import { useProgramAccess } from '@/hooks/use-program-access'

// Mock hooks
jest.mock('@/hooks/use-auth')
jest.mock('@/hooks/use-program-access')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseProgramAccess = useProgramAccess as jest.MockedFunction<typeof useProgramAccess>

describe('ProgramAccessGuard', () => {
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

    it('should render children when user has access', async () => {
        mockUseAuth.mockReturnValue({
            user: mockUser,
            loading: false,
            isAuthenticated: true,
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        })

        mockUseProgramAccess.mockReturnValue({
            hasAccess: true,
            loading: false,
            reason: 'purchased',
            error: undefined,
        })

        render(
            <ProgramAccessGuard programId={1} userId="test-user-id">
                <div>Programme contenu</div>
            </ProgramAccessGuard>
        )

        await waitFor(() => {
            expect(screen.getByText('Programme contenu')).toBeInTheDocument()
        })
    })

    it('should show loading state when auth is loading', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true,
            isAuthenticated: false,
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        })

        render(
            <ProgramAccessGuard programId={1} userId="test-user-id">
                <div>Programme contenu</div>
            </ProgramAccessGuard>
        )

        expect(screen.getByText('Chargement...')).toBeInTheDocument()
    })

    it('should show loading state when program access is loading', () => {
        mockUseAuth.mockReturnValue({
            user: mockUser,
            loading: false,
            isAuthenticated: true,
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        })

        mockUseProgramAccess.mockReturnValue({
            hasAccess: false,
            loading: true,
            reason: undefined,
            error: undefined,
        })

        render(
            <ProgramAccessGuard programId={1} userId="test-user-id">
                <div>Programme contenu</div>
            </ProgramAccessGuard>
        )

        expect(screen.getByText('Chargement...')).toBeInTheDocument()
    })

    it('should redirect to signin when user is not authenticated', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false,
            isAuthenticated: false,
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        })

        render(
            <ProgramAccessGuard programId={1} userId="test-user-id">
                <div>Programme contenu</div>
            </ProgramAccessGuard>
        )

        expect(screen.getByText('Vous devez être connecté pour accéder à ce programme.')).toBeInTheDocument()
        expect(screen.getByText('Se connecter')).toBeInTheDocument()
    })

    it('should show access denied message when user does not have access', () => {
        mockUseAuth.mockReturnValue({
            user: mockUser,
            loading: false,
            isAuthenticated: true,
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        })

        mockUseProgramAccess.mockReturnValue({
            hasAccess: false,
            loading: false,
            reason: 'not_purchased',
            error: undefined,
        })

        render(
            <ProgramAccessGuard programId={1} userId="test-user-id">
                <div>Programme contenu</div>
            </ProgramAccessGuard>
        )

        expect(screen.getByText('Vous n\'avez pas accès à ce programme.')).toBeInTheDocument()
        expect(screen.getByText('Retourner aux programmes')).toBeInTheDocument()
    })

    it('should show error message when there is an error', () => {
        mockUseAuth.mockReturnValue({
            user: mockUser,
            loading: false,
            isAuthenticated: true,
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        })

        mockUseProgramAccess.mockReturnValue({
            hasAccess: false,
            loading: false,
            reason: undefined,
            error: 'Erreur de vérification d\'accès',
        })

        render(
            <ProgramAccessGuard programId={1} userId="test-user-id">
                <div>Programme contenu</div>
            </ProgramAccessGuard>
        )

        expect(screen.getByText('Erreur lors de la vérification d\'accès.')).toBeInTheDocument()
    })

    it('should pass correct props to useProgramAccess hook', () => {
        mockUseAuth.mockReturnValue({
            user: mockUser,
            loading: false,
            isAuthenticated: true,
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        })

        mockUseProgramAccess.mockReturnValue({
            hasAccess: true,
            loading: false,
            reason: 'purchased',
            error: undefined,
        })

        render(
            <ProgramAccessGuard programId={2} userId="test-user-id" dayNumber={5}>
                <div>Programme contenu</div>
            </ProgramAccessGuard>
        )

        expect(mockUseProgramAccess).toHaveBeenCalledWith('test-user-id', 2, 5)
    })

    it('should not render children when access is denied', () => {
        mockUseAuth.mockReturnValue({
            user: mockUser,
            loading: false,
            isAuthenticated: true,
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        })

        mockUseProgramAccess.mockReturnValue({
            hasAccess: false,
            loading: false,
            reason: 'not_purchased',
            error: undefined,
        })

        render(
            <ProgramAccessGuard programId={1} userId="test-user-id">
                <div>Programme contenu</div>
            </ProgramAccessGuard>
        )

        expect(screen.queryByText('Programme contenu')).not.toBeInTheDocument()
    })
}) 
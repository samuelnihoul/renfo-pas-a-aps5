import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
        }
    },
    useSearchParams() {
        return new URLSearchParams()
    },
    usePathname() {
        return '/'
    },
}))

// Mock Next.js headers
jest.mock('next/headers', () => ({
    cookies() {
        return {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
        }
    },
    headers() {
        return {
            get: jest.fn(),
            set: jest.fn(),
        }
    },
}))

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key'
process.env.STRIPE_SECRET_KEY = 'sk_test_test'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3001'

// Global test utilities
global.fetch = jest.fn()

// Mock Stripe
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        checkout: {
            sessions: {
                create: jest.fn().mockResolvedValue({
                    id: 'cs_test_session',
                    url: 'https://checkout.stripe.com/test',
                }),
            },
        },
        webhooks: {
            constructEvent: jest.fn().mockReturnValue({
                type: 'checkout.session.completed',
                data: {
                    object: {
                        metadata: {
                            userId: 'test-user-id',
                            programId: '1',
                        },
                    },
                },
            }),
        },
    }))
})

// Mock bcrypt
jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn().mockResolvedValue(true),
}))

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('test-jwt-token'),
    verify: jest.fn().mockReturnValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        isAdmin: false,
        isPremium: false,
    }),
}))

// Mock uuid
jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('test-uuid'),
})) 
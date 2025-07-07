import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

// Mock Stripe
jest.mock('stripe')

const mockStripe = Stripe as jest.MockedClass<typeof Stripe>

describe('Stripe utilities', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('stripe instance', () => {
        it('should create Stripe instance with correct configuration', () => {
            expect(mockStripe).toHaveBeenCalledWith(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2024-12-18.acacia',
            })
        })

        it('should create Stripe instance with correct configuration', () => {
            expect(mockStripe).toHaveBeenCalledWith(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2024-12-18.acacia',
            })
        })
    })

    describe('checkout session creation', () => {
        it('should create checkout session successfully', async () => {
            const mockSession = {
                id: 'cs_test_session',
                url: 'https://checkout.stripe.com/test',
            }

            const mockStripeInstance = {
                checkout: {
                    sessions: {
                        create: jest.fn().mockResolvedValue(mockSession),
                    },
                },
            }

            mockStripe.mockImplementation(() => mockStripeInstance as any)

            const stripeInstance = new Stripe('test_key')
            const session = await stripeInstance.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: 'Programme Test',
                            },
                            unit_amount: 5000,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: 'http://localhost:3001/success',
                cancel_url: 'http://localhost:3001/cancel',
                metadata: {
                    userId: 'test-user-id',
                    programId: '1',
                },
            })

            expect(session).toEqual(mockSession)
            expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: 'Programme Test',
                            },
                            unit_amount: 5000,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: 'http://localhost:3001/success',
                cancel_url: 'http://localhost:3001/cancel',
                metadata: {
                    userId: 'test-user-id',
                    programId: '1',
                },
            })
        })

        it('should handle checkout session creation error', async () => {
            const mockStripeInstance = {
                checkout: {
                    sessions: {
                        create: jest.fn().mockRejectedValue(new Error('Stripe error')),
                    },
                },
            }

            mockStripe.mockImplementation(() => mockStripeInstance as any)

            const stripeInstance = new Stripe('test_key')

            await expect(
                stripeInstance.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [],
                    mode: 'payment',
                })
            ).rejects.toThrow('Stripe error')
        })
    })

    describe('webhook event construction', () => {
        it('should construct webhook event successfully', () => {
            const mockEvent = {
                type: 'checkout.session.completed',
                data: {
                    object: {
                        metadata: {
                            userId: 'test-user-id',
                            programId: '1',
                        },
                    },
                },
            }

            const mockStripeInstance = {
                webhooks: {
                    constructEvent: jest.fn().mockReturnValue(mockEvent),
                },
            }

            mockStripe.mockImplementation(() => mockStripeInstance as any)

            const stripeInstance = new Stripe('test_key')
            const event = stripeInstance.webhooks.constructEvent(
                'test_payload',
                'test_signature',
                'test_secret'
            )

            expect(event).toEqual(mockEvent)
            expect(mockStripeInstance.webhooks.constructEvent).toHaveBeenCalledWith(
                'test_payload',
                'test_signature',
                'test_secret'
            )
        })

        it('should handle webhook construction error', () => {
            const mockStripeInstance = {
                webhooks: {
                    constructEvent: jest.fn().mockImplementation(() => {
                        throw new Error('Invalid signature')
                    }),
                },
            }

            mockStripe.mockImplementation(() => mockStripeInstance as any)

            const stripeInstance = new Stripe('test_key')

            expect(() =>
                stripeInstance.webhooks.constructEvent(
                    'invalid_payload',
                    'invalid_signature',
                    'test_secret'
                )
            ).toThrow('Invalid signature')
        })
    })
}) 
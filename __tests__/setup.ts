import '@testing-library/jest-dom'

// Extend Jest matchers
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R
            toHaveClass(className: string): R
            toHaveAttribute(attr: string, value?: string): R
        }
    }
}

// Mock window.location
Object.defineProperty(window, 'location', {
    value: {
        href: '',
        reload: jest.fn(),
    },
    writable: true,
})

// Mock window.open
Object.defineProperty(window, 'open', {
    value: jest.fn(),
    writable: true,
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
})) 
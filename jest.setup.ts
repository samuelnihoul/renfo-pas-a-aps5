import '@testing-library/jest-dom'

// Mock window.location
delete (window as any).location
window.location = {
    href: '',
    reload: jest.fn(),
} as any

// Mock window.open
window.open = jest.fn()

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
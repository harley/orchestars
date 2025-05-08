import { vi } from 'vitest'
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended'
import type { Payload } from 'payload'

// Define a simplified PayloadRequest type for testing
interface MockPayloadRequest {
  payload: Payload
  user: any
  payloadAPI: string
  locale: string
  fallbackLocale: string
  i18n: any
  files: any
  body: any
  query: any
  params: any
  headers: Headers
  cookies: any
  ip: string
  originalUrl: string
  url: string
  method: string
  path?: string // Added for testing
  collection?: string
  doc?: any
  findByID: any
  findBySlug: any
  findGlobal: any
  create: any
  update: any
  delete: any
  find: any
  paginate: any
  where: any
  context: any
  get: any
  res: {
    status: any
    json: any
    send: any
    cookie: any
    clearCookie: any
  }
  next: any
}

// Create a deep mock of the Payload instance
export const mockPayload = (): DeepMockProxy<Payload> => {
  return mockDeep<Payload>()
}

// Create a mock PayloadRequest object
export const mockPayloadRequest = (
  overrides: Partial<MockPayloadRequest> = {},
): MockPayloadRequest => {
  const mockReq = {
    payload: mockPayload(),
    user: null,
    payloadAPI: 'local',
    locale: 'en',
    fallbackLocale: 'en',
    i18n: {},
    files: {},
    body: {},
    query: {},
    params: {},
    headers: new Headers(),
    cookies: {},
    ip: '127.0.0.1',
    originalUrl: '/',
    url: '/',
    method: 'GET',
    path: '/',
    collection: undefined,
    doc: undefined,
    findByID: vi.fn(),
    findBySlug: vi.fn(),
    findGlobal: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    find: vi.fn(),
    paginate: vi.fn(),
    where: {},
    context: {},
    get: vi.fn(),
    res: {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    },
    next: vi.fn(),
    ...overrides,
  } as MockPayloadRequest

  return mockReq
}

// Create a mock hook args object
export const mockHookArgs = <T = any>(overrides: Partial<T> = {}) => {
  return {
    req: mockPayloadRequest(),
    operation: 'create',
    ...overrides,
  } as unknown as T
}

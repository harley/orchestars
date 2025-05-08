import { faker } from '@faker-js/faker'
import type { User, Admin, Event, Order, Payment, Ticket } from '../../../src/payload-types'

// Create a factory for User
export const createUserFactory = (overrides: Partial<User> = {}): User => {
  return {
    id: faker.number.int(),
    email: faker.internet.email(),
    phone_number: faker.phone.number(),
    name: faker.person.fullName(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  } as User
}

// Create a factory for Admin
export const createAdminFactory = (overrides: Partial<Admin> = {}): Admin => {
  return {
    id: faker.number.int(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(['admin', 'super-admin', 'event-admin']),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  } as Admin
}

// Create a factory for Event
export const createEventFactory = (overrides: Partial<Event> = {}): Event => {
  return {
    id: faker.number.int(),
    name: faker.company.name() + ' Event',
    slug: faker.helpers.slugify(faker.company.name() + ' Event').toLowerCase(),
    status: faker.helpers.arrayElement(['draft', 'published']),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  } as Event
}

// Create a factory for Order
export const createOrderFactory = (overrides: Partial<Order> = {}): Order => {
  return {
    id: faker.number.int(),
    order_code: `ORDER-${faker.string.alphanumeric(8).toUpperCase()}`,
    status: faker.helpers.arrayElement(['pending', 'completed', 'cancelled']),
    total: faker.number.int({ min: 100000, max: 1000000 }),
    currency: 'VND',
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  } as Order
}

// Create a factory for Payment
export const createPaymentFactory = (overrides: Partial<Payment> = {}): Payment => {
  return {
    id: faker.number.int(),
    payment_code: `PAY-${faker.string.alphanumeric(8).toUpperCase()}`,
    status: faker.helpers.arrayElement(['pending', 'paid', 'failed']),
    amount: faker.number.int({ min: 100000, max: 1000000 }),
    payment_method: faker.helpers.arrayElement(['bank_transfer', 'zalopay']),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  } as Payment
}

// Create a factory for Ticket
export const createTicketFactory = (overrides: Partial<Ticket> = {}): Ticket => {
  return {
    id: faker.number.int(),
    ticket_code: `TICKET-${faker.string.alphanumeric(8).toUpperCase()}`,
    status: faker.helpers.arrayElement(['pending', 'booked', 'checked_in']),
    attendee_name: faker.person.fullName(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  } as Ticket
}

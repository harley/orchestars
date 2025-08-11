import { normalizeVietnamesePhoneNumber } from './normalizeVietnamesePhoneNumber'

export const formatCustomerInfo = (customer: {
  firstName: string
  lastName: string
  phoneNumber?: string
  email: string
}) => {
  // Trim all fields
  const firstName = customer?.firstName?.trim()
  const lastName = customer?.lastName?.trim()
  const phoneNumber = customer?.phoneNumber?.trim()
  const email = customer?.email?.trim()

  // Email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email format') // Invalid email format
  }

  const output: {
    firstName?: string
    lastName?: string
    phoneNumber?: string
    email?: string
  } = {}

  if (firstName) {
    output.firstName = firstName
  }
  if (lastName) {
    output.lastName = lastName
  }
  if (phoneNumber) {
    output.phoneNumber = normalizeVietnamesePhoneNumber(phoneNumber)
  }
  if (email) {
    output.email = email.toLowerCase()
  }

  return output
}

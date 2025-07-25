import { normalizeVietnamesePhoneNumber } from '@/utilities/normalizeVietnamesePhoneNumber'
import { APIError } from 'payload'

function trimString(value: any) {
  return typeof value === 'string' ? value.trim() : value
}

export const validateUser = async (args) => {
  const { data = {}, operation, req } = args
  if (!data) return data

  // Trim and normalize fields
  if (data.email) {
    data.email = trimString(data.email).toLowerCase()
  }
  if (data.phoneNumber) {
    data.phoneNumber = normalizeVietnamesePhoneNumber(trimString(data.phoneNumber))
  }
  if (data.firstName) {
    data.firstName = trimString(data.firstName)
  }
  if (data.lastName) {
    data.lastName = trimString(data.lastName)
  }

  // Ensure phoneNumbers array exists
  if (!Array.isArray(data.phoneNumbers)) {
    data.phoneNumbers = []
  }

  // Normalize all phone numbers in the array
  data.phoneNumbers = data.phoneNumbers.map((item) => ({
    ...item,
    phone: normalizeVietnamesePhoneNumber(trimString(item.phone)),
  }))

  // If phoneNumber is provided, check for duplication in phoneNumbers array and add if not present
  if (data.phoneNumber) {
    const normalizedPhone = data.phoneNumber
    const exists = data.phoneNumbers.some((item) => item.phone === normalizedPhone)
    if (!exists) {
      data.phoneNumbers.push({
        phone: normalizedPhone,
        createdAt: new Date().toISOString(),
        isUsing: true,
      })
    }
  }

  // Email format validation
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    throw new APIError('Invalid email format.', 400, {}, true)
  }

  // Duplication checks only on create
  if (operation === 'create') {
    // Check duplicate email
    if (data.email) {
      const existing = await req.payload.find({
        collection: 'users',
        where: { email: { equals: data.email } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        throw new APIError('Email already exists.', 400, {}, true)
      }
    }

    // Check duplicate phone numbers
    if (data.phoneNumber) {
      const existing = await req.payload.find({
        collection: 'users',
        where: { phoneNumber: { equals: data.phoneNumber } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        throw new APIError('Phone number already exists.', 400, {}, true)
      }
    }
  }

  return data
}

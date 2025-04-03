import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import crypto from 'crypto'

// AES encryption configuration
const ALGORITHM = 'aes-128-ctr'
const IV_LENGTH = 16 // 16 bytes for AES
const KEY = process.env.ENCRYPTION_KEY || 'YOUR_SECRET_HERE' // Make sure this matches your encryption key

function isBase64(str: string) {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str
  } catch {
    return false
  }
}

function decrypt(encryptedBase64: string): string {
  try {
    // Validate input
    if (!encryptedBase64) {
      console.error('Decrypt error: Empty input')
      throw new Error('Empty input')
    }

    // Validate base64
    if (!isBase64(encryptedBase64)) {
      console.error('Decrypt error: Invalid base64 input:', encryptedBase64)
      throw new Error('Invalid base64 input')
    }

    // Convert base64 to buffer
    const encryptedBuffer = Buffer.from(encryptedBase64, 'base64')

    // Extract IV from the beginning of the encrypted data
    const iv = encryptedBuffer.subarray(0, IV_LENGTH)
    const encryptedContent = encryptedBuffer.subarray(IV_LENGTH)


    // Create decipher
    const keyBuffer = Buffer.from(KEY).slice(0, 16)

    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv)

    // Decrypt
    const decrypted = Buffer.concat([decipher.update(encryptedContent), decipher.final()])
    const result = decrypted.toString('utf8')

    return result
  } catch (err) {
    const error = err as Error
    throw new Error(`Failed to decrypt data: ${error.message}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    // Parse request body
    const body = await req.json()

    const { email: encryptedEmail, password: encryptedPassword } = body

    if (!encryptedEmail || !encryptedPassword) {
      return NextResponse.json(
        { error: 'Encrypted email and password are required' },
        { status: 400 },
      )
    }

    // Decrypt the credentials
    let email, password
    try {
      email = decrypt(encryptedEmail)
      password = decrypt(encryptedPassword)

    } catch (err) {
      const error = err as Error
      return NextResponse.json(
        {
          error: 'Failed to decrypt credentials',
          details: error.message,
        },
        { status: 400 },
      )
    }

    // Attempt to login with Payload CMS
    const result = await payload.login({
      collection: 'admins',
      data: {
        email,
        password,
      },
    })

    if (!result.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check if user is an event admin
    if (!isAdminOrSuperAdminOrEventAdmin({ req: { user: result.user } })) {
      return NextResponse.json(
        { error: 'Unauthorized access. Only event admins can access the checkin app.' },
        { status: 403 },
      )
    }

    // Return user data and token
    return NextResponse.json({
      token: result.token,
    })
  } catch (err) {
    const error = err as Error

    return NextResponse.json(
      {
        error: 'Authentication failed',
        details: error.message,
      },
      { status: 500 },
    )
  }
}

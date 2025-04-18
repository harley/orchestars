import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import crypto from 'crypto'

// AES encryption configuration
const ALGORITHM = 'aes-128-ctr'
const IV_LENGTH = 16 // 16 bytes for AES
const KEY = process.env.PAYLOAD_SECRET || 'YOUR_SECRET_HERE' // Make sure this matches your encryption key

function isBase64(str: string) {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str
  } catch {
    return false
  }
}

function base64UrlToBase64(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) {
    base64 += '='
  }
  return base64
}

function decrypt(encryptedBase64: string): string {
  try {
    // Validate input
    if (!encryptedBase64) {
      console.error('Decrypt error: Empty input')
      throw new Error('Empty input')
    }

   
    const normalBase64 = base64UrlToBase64(encryptedBase64)

    // Validate base64
    if (!isBase64(normalBase64)) {
      console.error('Decrypt error: Invalid base64 input:', normalBase64)
      throw new Error('Invalid base64 input')
    }

    // Convert base64 to buffer
    const encryptedBuffer = Buffer.from(normalBase64, 'base64')

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
    const body = await req.json()
    const { email: maybeEncryptedEmail, password: maybeEncryptedPassword } = body

    if (!maybeEncryptedEmail || !maybeEncryptedPassword) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    // Determine if the request is same-origin
    const origin = req.headers.get('origin') || ''
    const referer = req.headers.get('referer') || ''
    const isSameOrigin =
      origin.includes(process.env.NEXT_PUBLIC_SERVER_URL || '') ||
      referer.includes(process.env.NEXT_PUBLIC_SERVER_URL || '')

    let email = maybeEncryptedEmail
    let password = maybeEncryptedPassword

    if (!isSameOrigin) {
      try {
        email = decrypt(maybeEncryptedEmail)
        password = decrypt(maybeEncryptedPassword)
        console.log('Decrypted email:', email)
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
    }

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

    if (!isAdminOrSuperAdminOrEventAdmin({ req: { user: result.user } })) {
      return NextResponse.json(
        { error: 'Unauthorized access. Only event admins can access the check-in app.' },
        { status: 403 },
      )
    }

    return NextResponse.json({
      token: result.token,
      user: result.user,
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

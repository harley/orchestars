import { NextRequest, NextResponse } from 'next/server'
import { signJwtToken } from '@/app/(payload)/api/user/utils'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { verifyPassword } from '@/utilities/password'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload()
    const body = await req.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const userRes = await payload.find({
      collection: 'users',
      where: { 
        email: { equals: email.toLowerCase() },
        role: { equals: 'affiliate' }
     },
      limit: 1,
      select: {
        id: true,
        email: true,
        hash: true,
        salt: true,
        firstName: true,
        lastName: true,
        username: true,
        status: true
      },
      showHiddenFields: true,
    })

    const user = userRes.docs[0]

    // Check if user exists and has authentication data
    if (!user || !user.salt || !user.hash) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, user.salt, user.hash)
    if (!valid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // Generate JWT token and set cookie
    await signJwtToken({
      fieldsToSign: {
        id: user.id,
        email: user.email,
        role: 'affiliate'
      }
    })

    // Return user data (excluding sensitive fields)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
    }

    return NextResponse.json({
      message: 'Login successful',
      user: userData
    })

  } catch (error) {
    console.error('Affiliate login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
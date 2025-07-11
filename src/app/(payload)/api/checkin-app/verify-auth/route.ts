import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { X_API_KEY } from '@/config/app'

export async function GET(request: NextRequest) {
  // Verify this is an internal request from our middleware
  const apiKey = request.headers.get('X-Api-Key')
  if (apiKey !== X_API_KEY) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const payload = await getPayload()
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user || !isAdminOrSuperAdminOrEventAdmin({ req: { user } })) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User is an authorized admin
    return NextResponse.json({ authenticated: true }, { status: 200 })
  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
} 
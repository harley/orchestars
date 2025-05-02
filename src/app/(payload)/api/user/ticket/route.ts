import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'
import { checkAuthenticated } from '@/utilities/checkAuthenticated'

export async function POST(request: NextRequest) {
    try {
        const payload = await getPayload()
    }
    catch { }
}
export async function GET(req: NextRequest) {
    try {
      const payload = await getPayload()

      const headers = await getHeaders()
      const { user } = await payload.auth({ headers })

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized - Invalid admin user' }, { status: 401 })
      }
    
      const result = await payload.find({
        collection: 'tickets',
        where: {
          user: {
            equals: 4,
          },
        },
        limit: 100, // optional limit
        sort: '-createdAt', // newest first
      })
  
      return NextResponse.json({ tickets: result.docs }, { status: 200 })
    } catch (error) {
      console.error('Get all user tickets error:', error)
      return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
    }
  }
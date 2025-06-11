import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    //    todo
    return NextResponse.json({
      success: true,
      data: [],
    })
  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.',
      },
      { status: 500 },
    )
  }
}

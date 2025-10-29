import { logOut } from '@/app/(auth)/actions'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const result = await logOut()
    
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    
    // Redirect to home page after logout
    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }
}


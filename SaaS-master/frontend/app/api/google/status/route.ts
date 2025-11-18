import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Get user from Supabase session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json(
        { connected: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check OAuth status from backend
    const response = await fetch(
      `http://localhost:3010/api/auth/google/status?email=${encodeURIComponent(user.email)}`
    )

    if (!response.ok) {
      throw new Error('Failed to check OAuth status')
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error checking Google connection:', error)
    return NextResponse.json(
      { 
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

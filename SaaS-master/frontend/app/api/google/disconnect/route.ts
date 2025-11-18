import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Get user from Supabase session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Disconnect from backend
    const response = await fetch(
      `http://localhost:3010/api/auth/google/disconnect?email=${encodeURIComponent(user.email)}`,
      { method: 'POST' }
    )

    if (!response.ok) {
      throw new Error('Failed to disconnect')
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error disconnecting Google:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

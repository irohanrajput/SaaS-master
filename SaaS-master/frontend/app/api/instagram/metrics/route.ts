import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

if (!BACKEND_URL) {
  throw new Error('NEXT_PUBLIC_BACKEND_URL environment variable is required')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const period = searchParams.get('period') || '7d'

    // If no email provided, try to get from session
    let userEmail: string | null = email
    if (!userEmail) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userEmail = user?.email || null
    }

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      )
    }

    // Call backend for real Instagram metrics
    const response = await fetch(
      `${BACKEND_URL}/api/instagram/metrics?email=${encodeURIComponent(userEmail)}&period=${period}`
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || 'Failed to fetch Instagram metrics',
          connected: false
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Instagram metrics error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Instagram metrics',
        connected: false
      },
      { status: 500 }
    )
  }
}

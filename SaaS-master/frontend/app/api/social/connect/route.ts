import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

if (!BACKEND_URL) {
  throw new Error('NEXT_PUBLIC_BACKEND_URL environment variable is required')
}

export async function POST(request: Request) {
  try {
    const { platform } = await request.json()
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user?.email) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Return the OAuth URL for the platform
    let oauthUrl = ''

    switch (platform.toLowerCase()) {
      case 'facebook':
        oauthUrl = `${BACKEND_URL}/api/auth/facebook?email=${encodeURIComponent(user.email)}`
        break
      case 'instagram':
        // Instagram uses same Facebook OAuth
        oauthUrl = `${BACKEND_URL}/api/auth/instagram?email=${encodeURIComponent(user.email)}`
        break
      case 'linkedin':
        oauthUrl = `${BACKEND_URL}/api/auth/linkedin?email=${encodeURIComponent(user.email)}`
        break
      case 'twitter':
      case 'twitter/x':
        return NextResponse.json(
          { success: false, message: 'Twitter/X integration coming soon' },
          { status: 501 }
        )
      default:
        return NextResponse.json(
          { success: false, message: `Unknown platform: ${platform}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      redirectUrl: oauthUrl,
      platform: platform
    })
  } catch (error) {
    console.error('Social connect error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to initiate connection' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { platform } = await request.json()
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user?.email) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Call backend to disconnect
    const response = await fetch(
      `${BACKEND_URL}/api/auth/${platform.toLowerCase()}/disconnect?email=${encodeURIComponent(user.email)}`,
      { method: 'POST' }
    )

    const result = await response.json()

    return NextResponse.json({
      success: result.success,
      message: result.message || `${platform} disconnected successfully`,
      platform: platform
    })
  } catch (error) {
    console.error('Social disconnect error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to disconnect platform' },
      { status: 500 }
    )
  }
}

// GET - Check connection status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user?.email) {
      return NextResponse.json(
        { connected: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }

    if (!platform) {
      return NextResponse.json(
        { connected: false, error: 'Platform parameter required' },
        { status: 400 }
      )
    }

    // Check connection status from backend
    const response = await fetch(
      `${BACKEND_URL}/api/auth/${platform.toLowerCase()}/status?email=${encodeURIComponent(user.email)}`
    )

    const result = await response.json()

    return NextResponse.json({
      connected: result.connected || false,
      platform: platform
    })
  } catch (error) {
    console.error('Connection status check error:', error)
    return NextResponse.json(
      { connected: false, error: 'Failed to check connection status' },
      { status: 500 }
    )
  }
}

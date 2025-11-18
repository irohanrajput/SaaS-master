import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      yourSite, 
      competitorSite, 
      email, 
      forceRefresh,
      yourInstagram,
      competitorInstagram,
      yourFacebook,
      competitorFacebook 
    } = body

    if (!yourSite || !competitorSite) {
      return NextResponse.json(
        { error: 'Both yourSite and competitorSite URLs are required' },
        { status: 400 }
      )
    }

    // Get user email from session if not provided
    let userEmail = email
    if (!userEmail) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userEmail = user?.email
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required. Please log in.' },
        { status: 401 }
      )
    }

    // Call backend competitor analysis API
    console.log('Calling backend API for competitor analysis...');
    console.log('Email:', userEmail);
    console.log('Your Site:', yourSite);
    console.log('Competitor:', competitorSite);
    console.log('Your Instagram:', yourInstagram || 'Not provided');
    console.log('Competitor Instagram:', competitorInstagram || 'Not provided');
    console.log('Your Facebook:', yourFacebook || 'Not provided');
    console.log('Competitor Facebook:', competitorFacebook || 'Not provided');
    
    const response = await fetch('http://localhost:3010/api/competitor/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        yourSite,
        competitorSite,
        yourInstagram,
        competitorInstagram,
        yourFacebook,
        competitorFacebook,
        forceRefresh: forceRefresh || false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Backend error:', errorData)
      throw new Error(errorData.error || 'Backend analysis failed')
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      ...data,
    })
  } catch (error) {
    console.error('Competitor analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze competitors',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

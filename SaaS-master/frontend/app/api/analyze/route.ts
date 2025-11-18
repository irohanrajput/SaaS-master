import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    console.log('🔍 Frontend API: Received analyze request for URL:', url)
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Extract domain from URL
    const domain = new URL(url).hostname.replace('www.', '')
    console.log('🔍 Frontend API: Extracted domain:', domain)
    
    // Call backend API with extended timeout (120 seconds for Lighthouse analysis)
    const backendUrl = 'http://localhost:3010/api/health/analyze'
    console.log('🔗 Frontend API: Calling backend at:', backendUrl)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 120 second timeout for full analysis
    
    try {
      const backendResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      console.log('📡 Frontend API: Backend response status:', backendResponse.status)

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text()
        console.error('❌ Frontend API: Backend error:', errorText)
        
        return NextResponse.json(
          { 
            error: 'Backend analysis failed',
            message: `Backend returned status ${backendResponse.status}`,
            details: errorText
          },
          { status: backendResponse.status }
        )
      }

      const data = await backendResponse.json()
      console.log('✅ Frontend API: Analysis completed successfully')
      
      return NextResponse.json(data)
      
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
    
  } catch (error) {
    console.error('❌ Frontend API: Analysis error:', error)
    
    // Handle timeout error
    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      return NextResponse.json(
        { 
          error: 'Analysis timeout',
          message: 'The website analysis is taking longer than expected. This can happen with large or complex websites.',
          details: 'Request timed out after 2 minutes. Please try again or choose a simpler page.',
          suggestion: 'Try analyzing a specific page URL instead of the entire domain.'
        },
        { status: 408 }
      )
    }
    
    // Handle connection refused (backend not running)
    if ((error instanceof Error && (error.cause as any)?.code === 'ECONNREFUSED') || (error as any).code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: 'Backend server not available',
          message: 'Unable to connect to the analysis service.',
          details: 'The backend server is not running on port 3010',
          solution: 'Start the backend server: cd backend && npm start'
        },
        { status: 503 }
      )
    }
    
    // Handle network errors
    if ((error instanceof Error && (error.cause as any)?.code === 'ETIMEDOUT') || (error as any).code === 'ETIMEDOUT') {
      return NextResponse.json(
        { 
          error: 'Network timeout',
          message: 'Network connection timeout while connecting to backend.',
          details: 'Please check your network connection and try again.'
        },
        { status: 504 }
      )
    }
    
    // Generic error
    return NextResponse.json(
      { 
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}

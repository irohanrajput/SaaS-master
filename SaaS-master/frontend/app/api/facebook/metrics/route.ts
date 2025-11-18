import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const period = searchParams.get('period')

  // Mock Facebook metrics data
  const mockData = {
    success: true,
    data: {
      followers: 1250,
      engagement: 4.2,
      reach: 5600,
      impressions: 12300,
      posts: 24,
      likes: 450,
      comments: 89,
      shares: 34,
      period: period || '7d',
      growth: {
        followers: 12.5,
        engagement: 8.3,
        reach: 15.7
      }
    }
  }

  return NextResponse.json(mockData)
}

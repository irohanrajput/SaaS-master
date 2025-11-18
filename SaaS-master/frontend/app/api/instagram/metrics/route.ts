import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const period = searchParams.get('period')

  // Mock Instagram metrics data
  const mockData = {
    success: true,
    data: {
      followers: 3400,
      engagement: 5.8,
      reach: 8900,
      impressions: 25600,
      posts: 18,
      likes: 890,
      comments: 234,
      shares: 67,
      period: period || '7d',
      growth: {
        followers: 18.2,
        engagement: 12.4,
        reach: 22.1
      }
    }
  }

  return NextResponse.json(mockData)
}

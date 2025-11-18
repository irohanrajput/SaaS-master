import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { platform } = await request.json()

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock successful connection
    const mockResponse = {
      success: true,
      message: `${platform} connected successfully`,
      platform: platform,
      connectedAt: new Date().toISOString(),
      profileInfo: {
        username: `user_${platform.toLowerCase()}_demo`,
        followers: Math.floor(Math.random() * 10000) + 1000,
        profileImage: `https://picsum.photos/seed/${platform}/100/100.jpg`
      }
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to connect platform' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { platform } = await request.json()

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Mock successful disconnection
    const mockResponse = {
      success: true,
      message: `${platform} disconnected successfully`,
      platform: platform,
      disconnectedAt: new Date().toISOString()
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to disconnect platform' },
      { status: 500 }
    )
  }
}

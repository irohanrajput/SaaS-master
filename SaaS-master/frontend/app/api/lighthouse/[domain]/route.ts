import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const { domain } = params;
    
    // Call your backend Express server
    const response = await fetch(`http://localhost:3010/api/lighthouse/${domain}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Backend API request failed');
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching lighthouse data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lighthouse data', details: error.message },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    devtools_frontend_url: "/devtools/inspector.html?ws=localhost:3002"
  })
}
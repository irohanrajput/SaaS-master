import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.COMPETITOR_API_URL || 'http://localhost:3010'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const preview = url.searchParams.get('preview')

  // Try proxying to the backend service first
  try {
    const backendUrl = `${BACKEND_URL}/api/competitor/ai-recommendations${preview ? '?preview=true' : ''}`
    const res = await fetch(backendUrl, { method: 'GET' })
    if (res.ok) {
      const json = await res.json()
      // normalize shape
      if (json && Array.isArray(json.recommendations)) {
        return NextResponse.json({ recommendations: json.recommendations })
      }
      if (Array.isArray(json)) {
        return NextResponse.json({ recommendations: json })
      }
      // otherwise return the raw json as recommendations if possible
      return NextResponse.json({ recommendations: json.recommendations || [] })
    }
    // fallthrough to fallback if backend responded non-ok
    console.warn('Backend returned non-ok for AI recommendations:', res.status)
  } catch (err) {
    console.warn('Error proxying to backend AI recommendations:', err)
  }

  // Fallback: generate simple heuristic recommendations (deterministic, useful for UI/testing)
  const fallback = [
    'Connect your analytics and competitor integrations to receive tailored AI recommendations.',
    'Identify top 5 pages with high impressions but low CTR and improve their meta titles/descriptions.',
    'Optimize hero images: compress and serve next-gen formats to improve Largest Contentful Paint (LCP).',
    'Add structured data (FAQ/Article/Product) to important pages to improve SERP visibility.',
    'Create targeted content spanning the keywords where competitors are outranking you.'
  ]

  // If preview requested, only return first 3
  const recommendations = preview ? fallback.slice(0, 3) : fallback

  return NextResponse.json({ recommendations })
}

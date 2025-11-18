import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const secretKey = process.env.STRIPE_SECRET_KEY

    if (!secretKey) {
      return NextResponse.json({
        success: false,
        error: 'STRIPE_SECRET_KEY not found in environment variables',
        config: {
          publishableKey: !!publishableKey,
          secretKey: false
        }
      })
    }

    // Test Stripe connection
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
    })

    // Try to list products to verify connection
    const products = await stripe.products.list({ limit: 1 })

    return NextResponse.json({
      success: true,
      message: 'Stripe connected successfully!',
      config: {
        publishableKey: !!publishableKey,
        secretKey: !!secretKey,
        mode: secretKey.startsWith('sk_test_') ? 'Test Mode' : 'Live Mode'
      },
      productsCount: products.data.length
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      config: {
        publishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secretKey: !!process.env.STRIPE_SECRET_KEY
      }
    })
  }
}
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
    const checks = {
        stripe_secret_key: !!process.env.STRIPE_SECRET_KEY,
        stripe_secret_key_format: process.env.STRIPE_SECRET_KEY?.startsWith('sk_'),
        stripe_publishable_key: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        pro_price_id: !!process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        enterprise_price_id: !!process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
        website_url: process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3002'
    }

    // Try to initialize Stripe
    let stripeTest = null
    if (process.env.STRIPE_SECRET_KEY) {
        try {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2024-06-20',
            })
            
            // Test API call
            const prices = await stripe.prices.list({ limit: 1 })
            stripeTest = {
                initialized: true,
                apiWorking: true,
                pricesCount: prices.data.length
            }
        } catch (error: any) {
            stripeTest = {
                initialized: true,
                apiWorking: false,
                error: error.message
            }
        }
    }

    return NextResponse.json({
        checks,
        stripeTest,
        timestamp: new Date().toISOString()
    })
}
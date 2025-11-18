import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'

// Initialize Stripe with error handling
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is not set in environment variables')
}

const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
    })
    : null

export async function POST(req: NextRequest) {
    try {
        // Check if Stripe is initialized
        if (!stripe) {
            console.error('❌ Stripe not initialized - missing STRIPE_SECRET_KEY')
            return NextResponse.json(
                { error: 'Payment system not configured' },
                { status: 500 }
            )
        }

        const body = await req.json()
        const { email, planName, planPrice, planFeatures } = body

        console.log('📝 Checkout request:', { email, planName, planPrice })

        // Validate required fields
        if (!email || !planName || planPrice === undefined) {
            console.error('❌ Missing required fields:', { email, planName, planPrice })
            return NextResponse.json(
                { error: 'Missing required fields: email, planName, and planPrice are required' },
                { status: 400 }
            )
        }

        // Get or create Stripe customer
        let customerId: string

        try {
            // Check if user already has a Stripe customer ID
            const [user] = await db
                .select()
                .from(usersTable)
                .where(eq(usersTable.email, email))

            console.log('👤 User found:', user ? 'Yes' : 'No')

            if (user?.stripe_id && !user.stripe_id.startsWith('mock_') && user.stripe_id.trim() !== '') {
                customerId = user.stripe_id
                console.log('✅ Using existing Stripe customer:', customerId)
            } else {
                // Create new Stripe customer
                console.log('📝 Creating new Stripe customer...')
                const customer = await stripe.customers.create({
                    email: email,
                    metadata: {
                        supabase_id: user?.id || '',
                    },
                })
                customerId = customer.id
                console.log('✅ New Stripe customer created:', customerId)

                // Update database with Stripe customer ID
                if (user) {
                    await db
                        .update(usersTable)
                        .set({ stripe_id: customerId })
                        .where(eq(usersTable.email, email))
                    console.log('✅ Database updated with Stripe customer ID')
                }
            }
        } catch (dbError) {
            console.error('❌ Database error:', dbError)
            return NextResponse.json(
                { error: 'Database error. Please try again.' },
                { status: 500 }
            )
        }

        // Create or retrieve Stripe product dynamically
        console.log('🔄 Creating/retrieving Stripe product...')
        let product: Stripe.Product
        
        try {
            // Search for existing product by name
            const products = await stripe.products.search({
                query: `active:'true' AND name:'${planName} Plan'`,
            })

            if (products.data.length > 0) {
                product = products.data[0]
                console.log('✅ Using existing product:', product.id)
            } else {
                // Create new product
                product = await stripe.products.create({
                    name: `${planName} Plan`,
                    description: `${planName} subscription plan`,
                    metadata: {
                        plan_name: planName,
                        features: JSON.stringify(planFeatures || []),
                    },
                })
                console.log('✅ New product created:', product.id)
            }
        } catch (productError: any) {
            console.error('❌ Product creation error:', productError)
            return NextResponse.json(
                { error: 'Failed to create product. Please try again.' },
                { status: 500 }
            )
        }

        // Create or retrieve price for the product
        console.log('🔄 Creating/retrieving Stripe price...')
        let price: Stripe.Price

        try {
            // Search for existing price for this product
            const prices = await stripe.prices.list({
                product: product.id,
                active: true,
                type: 'recurring',
            })

            const existingPrice = prices.data.find(
                (p) => p.unit_amount === planPrice * 100 && p.recurring?.interval === 'month'
            )

            if (existingPrice) {
                price = existingPrice
                console.log('✅ Using existing price:', price.id)
            } else {
                // Create new price
                price = await stripe.prices.create({
                    product: product.id,
                    unit_amount: planPrice * 100, // Convert dollars to cents
                    currency: 'usd',
                    recurring: {
                        interval: 'month',
                    },
                })
                console.log('✅ New price created:', price.id)
            }
        } catch (priceError: any) {
            console.error('❌ Price creation error:', priceError)
            return NextResponse.json(
                { error: 'Failed to create price. Please try again.' },
                { status: 500 }
            )
        }

        // Create Checkout Session
        console.log('🔄 Creating Stripe checkout session...')
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${
                process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3002'
            }/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${
                process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3002'
            }/subscribe`,
            metadata: {
                plan: planName,
                user_email: email,
            },
            allow_promotion_codes: true,
            billing_address_collection: 'auto',
        })

        console.log('✅ Checkout session created:', session.id)
        console.log('🎉 Dynamic pricing successful! Product:', product.id, 'Price:', price.id)
        
        return NextResponse.json({ 
            sessionUrl: session.url,
            sessionId: session.id,
            productId: product.id,
            priceId: price.id
        })

    } catch (error: any) {
        console.error('❌ Stripe checkout error:', error)
        
        return NextResponse.json(
            { 
                error: 'Failed to create checkout session',
                message: error.message || 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            },
            { status: 500 }
        )
    }
}

// Add these to your .env file
// NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID
// NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_YOUR_ENTERPRISE_PRICE_ID
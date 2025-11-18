import Stripe from 'stripe'
import { db } from '../db/db'
import { usersTable } from '../db/schema'
import { eq } from 'drizzle-orm'

const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3002'

// Enable Stripe for testing (set to false to disable)
const DISABLE_STRIPE = false

// Initialize Stripe with error handling
let stripe: Stripe | null = null
if (!DISABLE_STRIPE) {
    try {
        if (process.env.STRIPE_SECRET_KEY) {
            stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2024-06-20',
            })
            console.log('✅ Stripe initialized successfully')
        } else {
            console.error('❌ STRIPE_SECRET_KEY not found in environment variables')
        }
    } catch (error) {
        console.error('❌ Stripe initialization failed:', error)
    }
} else {
    console.log('⚠️ Stripe is disabled in configuration')
}

export async function createStripeCustomer(id: string, email: string, name?: string) {
    if (DISABLE_STRIPE || !stripe) {
        console.log('Stripe disabled, skipping customer creation')
        return `mock_customer_${id.substring(0, 8)}`
    }

    try {
        const customer = await stripe.customers.create({
            name: name || email.split('@')[0],
            email: email,
            metadata: {
                supabase_id: id
            }
        })
        console.log('✅ Stripe customer created:', customer.id)
        return customer.id
    } catch (error) {
        console.error('❌ Stripe customer creation failed:', error)
        throw error
    }
}

export async function getStripePlan(email: string) {
    if (DISABLE_STRIPE || !stripe) {
        return 'free'
    }

    try {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email))
        
        if (!user || !user.stripe_id || user.stripe_id === '' || user.stripe_id.startsWith('mock_')) {
            return 'free'
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripe_id,
            status: 'active',
            limit: 1
        })

        if (subscriptions.data.length > 0) {
            return subscriptions.data[0].items.data[0].price.id
        }

        return 'free'
    } catch (error) {
        console.error('Error fetching Stripe plan:', error)
        return 'free'
    }
}

export async function createStripeCheckoutSession(email: string) {
    if (DISABLE_STRIPE || !stripe) {
        console.log('⚠️ Stripe disabled, returning mock session')
        return 'mock_session_secret'
    }

    try {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email))
        
        if (!user) {
            throw new Error('User not found')
        }

        let stripeCustomerId = user.stripe_id

        // If user doesn't have a Stripe customer, create one
        if (!stripeCustomerId || stripeCustomerId === '' || stripeCustomerId.startsWith('mock_')) {
            console.log('📝 Creating new Stripe customer for:', email)
            stripeCustomerId = await createStripeCustomer(user.id, user.email, user.name)
            
            // Update database with new Stripe customer ID
            await db.update(usersTable)
                .set({ stripe_id: stripeCustomerId })
                .where(eq(usersTable.email, email))
            
            console.log('✅ Database updated with Stripe customer ID')
        }

        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID || 'price_1234567890',
                    quantity: 1,
                },
            ],
            success_url: `${PUBLIC_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${PUBLIC_URL}/subscribe`,
        })

        console.log('✅ Checkout session created:', session.id)
        return session.client_secret || ''
    } catch (error) {
        console.error('❌ Error creating checkout session:', error)
        throw error
    }
}

export async function generateStripeBillingPortalLink(email: string) {
    if (DISABLE_STRIPE || !stripe) {
        return '/subscribe'
    }

    try {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email))
        
        // Check if user exists and has a valid Stripe customer ID
        if (!user || !user.stripe_id || user.stripe_id === '' || user.stripe_id.startsWith('mock_')) {
            return '/subscribe'
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripe_id,
            return_url: `${PUBLIC_URL}/dashboard`,
        })

        return session.url
    } catch (error: any) {
        // Silently handle billing portal errors and redirect to subscribe page
        return '/subscribe'
    }
}
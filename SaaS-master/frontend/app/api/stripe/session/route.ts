import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
    })
    : null

export async function GET(req: NextRequest) {
    try {
        if (!stripe) {
            return NextResponse.json(
                { error: 'Stripe not configured' },
                { status: 500 }
            )
        }

        const { searchParams } = new URL(req.url)
        const sessionId = searchParams.get('session_id')

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Missing session_id parameter' },
                { status: 400 }
            )
        }

        console.log('🔍 Fetching Stripe session:', sessionId)

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        console.log('✅ Session retrieved:', session.id)

        return NextResponse.json({
            id: session.id,
            amount_total: session.amount_total,
            currency: session.currency,
            customer: session.customer,
            payment_status: session.payment_status,
            metadata: session.metadata,
        })

    } catch (error: any) {
        console.error('❌ Session retrieval error:', error)
        return NextResponse.json(
            { error: 'Failed to retrieve session', message: error.message },
            { status: 500 }
        )
    }
}
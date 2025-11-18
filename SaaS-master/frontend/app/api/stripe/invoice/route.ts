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

        // Retrieve the session
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['invoice'],
        })

        if (!session.invoice) {
            return NextResponse.json(
                { error: 'Invoice not found for this session' },
                { status: 404 }
            )
        }

        const invoice = session.invoice as Stripe.Invoice

        return NextResponse.json({
            invoiceUrl: invoice.hosted_invoice_url || invoice.invoice_pdf,
            invoiceId: invoice.id,
            invoiceNumber: invoice.number,
        })

    } catch (error: any) {
        console.error('❌ Invoice retrieval error:', error)
        return NextResponse.json(
            { error: 'Failed to retrieve invoice', message: error.message },
            { status: 500 }
        )
    }
}
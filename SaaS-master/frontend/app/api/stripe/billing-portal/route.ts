import { generateStripeBillingPortalLink } from '@/utils/stripe/api'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()
        
        if (!email) {
            return Response.json({ error: 'Email is required' }, { status: 400 })
        }
        
        const url = await generateStripeBillingPortalLink(email)
        
        return Response.json({ url })
    } catch (error) {
        console.error('Billing portal error:', error)
        return Response.json({ url: '/subscribe' })
    }
}
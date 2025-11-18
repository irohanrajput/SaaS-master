'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Download, ArrowRight, Loader2 } from 'lucide-react'

export default function SubscribeSuccess() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const sessionId = searchParams.get('session_id')
    
    const [loading, setLoading] = useState(true)
    const [sessionData, setSessionData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (sessionId) {
            // Fetch session details from Stripe
            fetch(`/api/stripe/session?session_id=${sessionId}`)
                .then(res => res.json())
                .then(data => {
                    setSessionData(data)
                    setLoading(false)
                })
                .catch(err => {
                    console.error('Error fetching session:', err)
                    setError('Failed to load payment details')
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }, [sessionId])

    const handleDownloadInvoice = async () => {
        if (!sessionId) return

        try {
            const response = await fetch(`/api/stripe/invoice?session_id=${sessionId}`)
            const data = await response.json()
            
            if (data.invoiceUrl) {
                window.open(data.invoiceUrl, '_blank')
            } else {
                alert('Invoice not available yet. Please check your email.')
            }
        } catch (err) {
            console.error('Error downloading invoice:', err)
            alert('Failed to download invoice. Please check your email.')
        }
    }

    return (
        <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen p-4">
            <Card className="w-full max-w-md mx-auto shadow-xl">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <div className="bg-green-100 rounded-full p-3">
                            <CheckCircle className="w-16 h-16 text-green-600" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <CardTitle className="text-3xl font-bold text-gray-900">
                            Payment Successful! 🎉
                        </CardTitle>
                        <CardDescription className="text-base text-gray-600">
                            Thank you for subscribing to our Pro Plan
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-gray-600">Loading payment details...</span>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <p className="text-red-700">{error}</p>
                        </div>
                    ) : sessionData ? (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Plan:</span>
                                <span className="font-semibold text-gray-900">
                                    {sessionData.metadata?.plan || 'Pro Plan'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Amount Paid:</span>
                                <span className="font-semibold text-gray-900">
                                    ${(sessionData.amount_total / 100).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Billing:</span>
                                <span className="font-semibold text-gray-900">Monthly</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Status:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {/* What's Next Section */}
                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">What&apos;s Next?</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>A confirmation email has been sent to your inbox</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Your account has been upgraded to Pro</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>All premium features are now unlocked</span>
                            </li>
                        </ul>
                    </div>
                </CardContent>

                <CardFooter className="flex-col gap-3">
                    {sessionId && (
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={handleDownloadInvoice}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Invoice
                        </Button>
                    )}
                    
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                        <Link href="/dashboard" className="flex items-center justify-center gap-2">
                            Go to Dashboard
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>

                    <p className="text-xs text-center text-gray-500 mt-2">
                        Need help? <Link href="mailto:support@yourcompany.com" className="text-blue-600 hover:underline">Contact Support</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'

function LinkedInCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Connecting your LinkedIn account...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const code = searchParams?.get('code')
        const state = searchParams?.get('state')
        const error = searchParams?.get('error')
        const errorDescription = searchParams?.get('error_description')

        // Check for OAuth errors
        if (error) {
          console.error('LinkedIn OAuth error:', error, errorDescription)
          setStatus('error')
          setMessage(errorDescription || 'LinkedIn authorization failed')
          
          setTimeout(() => {
            router.push('/dashboard/social?error=linkedin_auth_failed')
          }, 2000)
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('No authorization code received')
          
          setTimeout(() => {
            router.push('/dashboard/social?error=no_code')
          }, 2000)
          return
        }

        // ⚠️ CRITICAL: Prevent duplicate code usage
        // Check if this code was already processed
        const processedCode = sessionStorage.getItem('linkedin_processed_code')
        if (processedCode === code) {
          console.warn('⚠️ Authorization code already processed, skipping...')
          setStatus('success')
          setMessage('LinkedIn already connected! Redirecting...')
          setTimeout(() => {
            router.push('/dashboard/social?success=true&connected=linkedin')
          }, 1000)
          return
        }

        // Mark this code as being processed
        sessionStorage.setItem('linkedin_processed_code', code)

        console.log('✅ Authorization code received')

        // Get user email from Supabase
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user?.email) {
          setStatus('error')
          setMessage('User not authenticated')
          
          setTimeout(() => {
            router.push('/login')
          }, 2000)
          return
        }

        console.log('📧 User email:', user.email)
        setMessage('Exchanging authorization code...')

        // ⚠️ LinkedIn does NOT support PKCE for web applications
        // No need to retrieve or send code_verifier

        // Exchange code for access token via backend
        const response = await fetch('http://localhost:3010/api/auth/linkedin/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: code,
            email: user.email,
            state: state
            // NO code_verifier - LinkedIn web OAuth doesn't use PKCE
          })
        })

        // Clean up session storage
        sessionStorage.removeItem('linkedin_oauth_state')
        sessionStorage.removeItem('linkedin_user_email')
        // Keep processed_code for a bit to prevent duplicate processing
        setTimeout(() => {
          sessionStorage.removeItem('linkedin_processed_code')
        }, 5000)

        const data = await response.json()

        if (!response.ok || !data.success) {
          console.error('Failed to exchange code:', data)
          setStatus('error')
          
          // Show specific error message
          let errorMsg = data.message || 'Failed to connect LinkedIn account'
          if (data.error === 'invalid_grant') {
            errorMsg = 'Authorization code expired or already used. Please try connecting again.'
          } else if (data.error === 'invalid_client') {
            errorMsg = 'Invalid LinkedIn app credentials. Please contact support.'
          }
          
          setMessage(errorMsg)
          
          setTimeout(() => {
            router.push('/dashboard/social?error=token_exchange_failed')
          }, 3000)
          return
        }

        console.log('✅ LinkedIn account connected successfully')
        setStatus('success')
        setMessage('LinkedIn connected! Redirecting...')

        // Store token in localStorage for immediate use
        if (data.data?.access_token) {
          localStorage.setItem('linkedin_access_token', data.data.access_token)
          localStorage.setItem('linkedin_user_email', user.email)
          console.log('💾 Token stored in localStorage')
        }

        // Redirect to social dashboard with success
        setTimeout(() => {
          router.push('/dashboard/social?success=true&connected=linkedin')
        }, 1500)

      } catch (error) {
        console.error('Error in LinkedIn callback:', error)
        setStatus('error')
        setMessage('An unexpected error occurred')
        
        setTimeout(() => {
          router.push('/dashboard/social?error=callback_error')
        }, 2000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connecting LinkedIn</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function LinkedInCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4">Loading...</div>
        </div>
      </div>
    }>
      <LinkedInCallbackContent />
    </Suspense>
  )
}

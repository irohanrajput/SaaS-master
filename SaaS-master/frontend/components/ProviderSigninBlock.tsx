'use client'

import { Button } from '@/components/ui/button'
import { FaGoogle } from 'react-icons/fa'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

interface ProviderSigninBlockProps {
  mode?: 'signin' | 'signup'
}

export default function ProviderSigninBlock({ mode = 'signup' }: ProviderSigninBlockProps) {
  const [isLoading, setIsLoading] = useState(false)
  const googleButtonText = mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('Error signing in with Google:', error)
        setIsLoading(false)
      }
      // If successful, user will be redirected, so no need to setIsLoading(false)
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        variant="outline"
        className="w-full h-14 bg-orange-50/50 border-orange-200 hover:bg-orange-100/50 hover:border-orange-300 text-gray-800 font-medium rounded-xl transition-all flex items-center justify-center gap-3 text-base disabled:opacity-50"
      >
        <FaGoogle className="w-5 h-5 text-orange-500" />
        <span>{isLoading ? 'Redirecting...' : googleButtonText}</span>
      </Button>
    </div>
  )
}
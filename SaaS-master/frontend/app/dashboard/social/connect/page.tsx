'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Platform {
  name: string
  icon: any
  color: string
  connected: boolean
  description: string
}

export default function SocialConnectPage() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      connected: false,
      description: 'Connect your Facebook Page to track posts, engagement, and audience insights'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-600 to-pink-600',
      connected: false,
      description: 'Connect your Instagram Business account to monitor posts, stories, and follower growth'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700',
      connected: false,
      description: 'Connect your LinkedIn Company Page to track professional engagement metrics'
    },
    {
      name: 'Twitter/X',
      icon: Twitter,
      color: 'bg-black',
      connected: false,
      description: 'Connect your Twitter account to analyze tweets, engagement, and reach'
    }
  ])

  const handleConnectPlatform = async (platformName: string) => {
    setIsLoading(platformName)
    try {
      console.log(`Attempting to connect ${platformName}...`)
      console.log(`API URL: ${API_URL}`)
      
      const response = await fetch(`${API_URL}/api/social/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform: platformName }),
      })

      console.log(`Response status: ${response.status}`)
      
      const result = await response.json()
      console.log(`Response result:`, result)
      
      if (result.success) {
        // Update platform connection status
        setPlatforms(prev =>
          prev.map(platform =>
            platform.name === platformName
              ? { ...platform, connected: true }
              : platform
          )
        )
        console.log(`${platformName} connected:`, result)
        alert(`${platformName} connected successfully!`)
      } else {
        console.error(`Failed to connect ${platformName}:`, result.message)
        alert(`Failed to connect ${platformName}: ${result.message}`)
      }
    } catch (error) {
      console.error(`Error connecting ${platformName}:`, error)
      alert(`Error connecting ${platformName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(null)
    }
  }

  const handleDisconnectPlatform = async (platformName: string) => {
    setIsLoading(platformName)
    try {
      console.log(`Attempting to disconnect ${platformName}...`)
      
      const response = await fetch(`${API_URL}/api/social/connect`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform: platformName }),
      })

      console.log(`Disconnect response status: ${response.status}`)
      
      const result = await response.json()
      console.log(`Disconnect result:`, result)
      
      if (result.success) {
        // Update platform connection status
        setPlatforms(prev => 
          prev.map(platform => 
            platform.name === platformName 
              ? { ...platform, connected: false }
              : platform
          )
        )
        console.log(`${platformName} disconnected:`, result)
        alert(`${platformName} disconnected successfully!`)
      } else {
        console.error(`Failed to disconnect ${platformName}:`, result.message)
        alert(`Failed to disconnect ${platformName}: ${result.message}`)
      }
    } catch (error) {
      console.error(`Error disconnecting ${platformName}:`, error)
      alert(`Error disconnecting ${platformName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(null)
    }
  }

  const handleGoBack = () => {
    router.push('/dashboard')
  }

  const connectedCount = platforms.filter(p => p.connected).length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect Social Media Platforms</h1>
          <p className="text-gray-600">
            Connect your social media accounts to start tracking performance metrics and insights.
          </p>
          {connectedCount > 0 && (
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-800">
                {connectedCount} platform{connectedCount > 1 ? 's' : ''} connected
              </Badge>
            </div>
          )}
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon
            return (
              <Card key={platform.name} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        {platform.connected && (
                          <div className="flex items-center text-green-600 text-sm mt-1">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Connected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {platform.description}
                  </p>
                  <Button
                    onClick={() => platform.connected 
                      ? handleDisconnectPlatform(platform.name)
                      : handleConnectPlatform(platform.name)
                    }
                    disabled={isLoading === platform.name}
                    className={`w-full ${
                      platform.connected
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                  >
                    {isLoading === platform.name 
                      ? (platform.connected ? 'Disconnecting...' : 'Connecting...')
                      : (platform.connected ? 'Disconnect' : `Connect ${platform.name}`)
                    }
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Continue Button */}
        {connectedCount > 0 && (
          <div className="mt-8 text-center">
            <Button 
              onClick={handleGoBack}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
            >
              Continue to Dashboard
            </Button>
            <p className="text-gray-500 text-sm mt-2">
              Your connected platforms will now appear in your social metrics dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

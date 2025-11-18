import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function SocialMediaPerformanceDialog() {
  const handleConnectPlatform = () => {
    // Redirect to social media connection page or open connection modal
    window.location.href = '/dashboard/social/connect'
  }

  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardContent className="p-12 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No social media data available</h3>
        <p className="text-sm text-gray-500 mb-6">
          Connect your platform account to view social metrics
        </p>
        <Button 
          onClick={handleConnectPlatform}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6"
        >
          Connect Platform
        </Button>
      </CardContent>
    </Card>
  )
}

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Activity, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface GAGSCConnectionCardProps {
  gaGscConnected: boolean
  checkingConnection: boolean
  syncingDomain: boolean
  hasDomain: boolean
  userEmail: string
  onConnect: () => void
  onSyncDomain: () => void
}

export default function GAGSCConnectionCard({
  gaGscConnected,
  checkingConnection,
  syncingDomain,
  hasDomain,
  userEmail,
  onConnect,
  onSyncDomain
}: GAGSCConnectionCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Activity className="w-4 h-4 text-gray-900" />
              Step 1: Connect Google Services
            </CardTitle>
            <CardDescription className="text-sm">Required to automatically fetch your domain</CardDescription>
          </div>
          {gaGscConnected ? (
            <Badge className="bg-green-50 text-green-700 border border-green-200 font-normal">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="border-gray-300 text-gray-600 font-normal">
              Not Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {checkingConnection ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking connection...
          </div>
        ) : !gaGscConnected ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect Google Analytics and Search Console to automatically fetch your domain.
                This is required for competitor analysis.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={onConnect}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
            >
              <Activity className="w-4 h-4 mr-2" />
              Connect Google Analytics & Search Console
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium text-sm">Successfully connected to Google services</span>
            </div>
            {!hasDomain && (
              <Button 
                onClick={onSyncDomain}
                disabled={syncingDomain}
                variant="outline"
              >
                {syncingDomain ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing domain...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Domain from Search Console
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

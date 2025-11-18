'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Building2, Globe, AlertCircle } from 'lucide-react'
import { 
  Instagram as InstagramIcon, 
  Facebook as FacebookIcon,
  Linkedin as LinkedinIcon
} from 'lucide-react'

interface BusinessInfo {
  business_name: string
  business_domain: string
  business_description: string
  business_industry: string
  facebook_handle: string
  instagram_handle: string
  linkedin_handle: string
  twitter_handle: string
}

interface BusinessInfoCardProps {
  businessInfo: BusinessInfo
  editingBusinessInfo: boolean
  savingBusinessInfo: boolean
  syncingDomain: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  onSyncDomain: () => void
  onChange: (field: keyof BusinessInfo, value: string) => void
}

export default function BusinessInfoCard({
  businessInfo,
  editingBusinessInfo,
  savingBusinessInfo,
  syncingDomain,
  onEdit,
  onCancel,
  onSave,
  onSyncDomain,
  onChange
}: BusinessInfoCardProps) {
  if (!businessInfo.business_domain && !editingBusinessInfo) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Building2 className="w-4 h-4 text-gray-900" />
            Step 2: Your Business
          </CardTitle>
          <CardDescription className="text-sm">Domain automatically fetched from Google Search Console</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Click the button below to automatically fetch your domain from Google Search Console
            </AlertDescription>
          </Alert>
          <Button 
            onClick={onSyncDomain}
            disabled={syncingDomain}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {syncingDomain ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching domain...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Fetch My Domain from GSC
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Building2 className="w-4 h-4 text-gray-900" />
              Step 2: Your Business
            </CardTitle>
            <CardDescription className="text-sm">Domain automatically fetched from Google Search Console</CardDescription>
          </div>
          {businessInfo.business_domain && !editingBusinessInfo && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onEdit}
              className="border-gray-200"
            >
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {editingBusinessInfo ? (
          <div className="space-y-4">
            {/* Domain (Read-only) */}
            <div>
              <Label>Domain (from Google Search Console)</Label>
              <Input 
                value={businessInfo.business_domain}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Domain is automatically synced from Google Search Console
              </p>
            </div>

            {/* Business Name */}
            <div>
              <Label>Business Name (Optional)</Label>
              <Input 
                placeholder="My Company Inc."
                value={businessInfo.business_name}
                onChange={(e) => onChange('business_name', e.target.value)}
              />
            </div>

            {/* Industry */}
            <div>
              <Label>Industry (Optional)</Label>
              <Input 
                placeholder="E-commerce, SaaS, etc."
                value={businessInfo.business_industry}
                onChange={(e) => onChange('business_industry', e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description (Optional)</Label>
              <Textarea 
                placeholder="Brief description of your business..."
                value={businessInfo.business_description}
                onChange={(e) => onChange('business_description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Social Media Handles */}
            <div className="space-y-3">
              <Label>Social Media Handles (Optional)</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Facebook"
                  value={businessInfo.facebook_handle}
                  onChange={(e) => onChange('facebook_handle', e.target.value)}
                />
                <Input 
                  placeholder="Instagram"
                  value={businessInfo.instagram_handle}
                  onChange={(e) => onChange('instagram_handle', e.target.value)}
                />
                <Input 
                  placeholder="LinkedIn"
                  value={businessInfo.linkedin_handle}
                  onChange={(e) => onChange('linkedin_handle', e.target.value)}
                />
                <Input 
                  placeholder="Twitter"
                  value={businessInfo.twitter_handle}
                  onChange={(e) => onChange('twitter_handle', e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={onSave}
                disabled={savingBusinessInfo}
              >
                {savingBusinessInfo ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Business Info'
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={onCancel}
                disabled={savingBusinessInfo}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{businessInfo.business_domain}</span>
              <Badge variant="secondary" className="text-xs">from GSC</Badge>
            </div>
            {businessInfo.business_name && (
              <div className="text-sm">
                <span className="text-gray-600">Name:</span> {businessInfo.business_name}
              </div>
            )}
            {businessInfo.business_industry && (
              <div className="text-sm">
                <span className="text-gray-600">Industry:</span> {businessInfo.business_industry}
              </div>
            )}
            {(businessInfo.facebook_handle || businessInfo.instagram_handle || businessInfo.linkedin_handle) && (
              <div className="flex gap-2 flex-wrap">
                {businessInfo.facebook_handle && (
                  <Badge variant="outline" className="text-xs">
                    <FacebookIcon className="w-3 h-3 mr-1" />
                    {businessInfo.facebook_handle}
                  </Badge>
                )}
                {businessInfo.instagram_handle && (
                  <Badge variant="outline" className="text-xs">
                    <InstagramIcon className="w-3 h-3 mr-1" />
                    {businessInfo.instagram_handle}
                  </Badge>
                )}
                {businessInfo.linkedin_handle && (
                  <Badge variant="outline" className="text-xs">
                    <LinkedinIcon className="w-3 h-3 mr-1" />
                    {businessInfo.linkedin_handle}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

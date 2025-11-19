'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, AlertCircle, Clock, Download } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useSubscription } from '@/contexts/SubscriptionContext'

// Modular components
import GAGSCConnectionCard from './competitor/GAGSCConnectionCard'
import BusinessInfoCard from './competitor/BusinessInfoCard'
import CompetitorsCard from './competitor/CompetitorsCard'
import AddCompetitorDialog from './competitor/AddCompetitorDialog'
import CompetitorResults from './CompetitorResults'

interface Competitor {
  id: string
  domain: string
  instagram: string
  facebook: string
  linkedin: string
}

interface BusinessInfo {
  business_name: string
  business_domain: string
  business_description: string
  business_industry: string
  facebook_handle: string
  instagram_handle: string
  linkedin_handle: string
  twitter_handle: string
  youtube_handle: string
  tiktok_handle: string
}

export default function CompetitorIntelligence() {
  const { plan, getLimit } = useSubscription()
  const [userEmail, setUserEmail] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const [gaGscConnected, setGaGscConnected] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(true)
  const [syncingDomain, setSyncingDomain] = useState(false)
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    business_name: '',
    business_domain: '',
    business_description: '',
    business_industry: '',
    facebook_handle: '',
    instagram_handle: '',
    linkedin_handle: '',
    twitter_handle: '',
    youtube_handle: '',
    tiktok_handle: ''
  })
  const [editingBusinessInfo, setEditingBusinessInfo] = useState(false)
  const [savingBusinessInfo, setSavingBusinessInfo] = useState(false)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [showAddCompetitor, setShowAddCompetitor] = useState(false)
  const [newCompetitor, setNewCompetitor] = useState({
    domain: '',
    instagram: '',
    facebook: '',
    linkedin: ''
  })
  const [addingCompetitor, setAddingCompetitor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<any>(null)
  const [isCached, setIsCached] = useState(false)
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [analysisType, setAnalysisType] = useState<'seo' | 'ads' | 'content' | 'social' | 'technical'>('seo')

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load user data on mount AND restore previous analysis results
  useEffect(() => {
    if (!isClient) return
    
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email) {
        setUserEmail(user.email)
        await loadAllData(user.email)
        
        // Restore previous analysis results from localStorage
        try {
          const savedResults = localStorage.getItem(`competitor_results_${user.email}`)
          const savedCompetitor = localStorage.getItem(`selected_competitor_${user.email}`)
          
          if (savedResults && savedCompetitor) {
            const parsedResults = JSON.parse(savedResults)
            const parsedCompetitor = JSON.parse(savedCompetitor)
            
            // Check if results are less than 24 hours old
            const resultsAge = Date.now() - (parsedResults.timestamp || 0)
            const maxAge = 24 * 60 * 60 * 1000 // 24 hours
            
            if (resultsAge < maxAge) {
              setResults(parsedResults)
              setSelectedCompetitor(parsedCompetitor)
              setIsCached(true)
              console.log('✅ Restored previous analysis results from localStorage')
            } else {
              // Clear old results
              localStorage.removeItem(`competitor_results_${user.email}`)
              localStorage.removeItem(`selected_competitor_${user.email}`)
              console.log('🗑️ Cleared old analysis results (>24h)')
            }
          }
        } catch (error) {
          console.error('Failed to restore analysis results:', error)
        }
      }
    }
    
    init()
  }, [isClient])

  const loadAllData = async (email: string) => {
    try {
      setCheckingConnection(true)
      const response = await fetch(`http://localhost:3010/api/business-info?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (data.success) {
        setGaGscConnected(data.ga_gsc_connected || false)
        
        if (data.data) {
          setBusinessInfo({
            business_name: data.data.business_name || '',
            business_domain: data.data.business_domain || '',
            business_description: data.data.business_description || '',
            business_industry: data.data.business_industry || '',
            facebook_handle: data.data.facebook_handle || '',
            instagram_handle: data.data.instagram_handle || '',
            linkedin_handle: data.data.linkedin_handle || '',
            twitter_handle: data.data.twitter_handle || '',
            youtube_handle: data.data.youtube_handle || '',
            tiktok_handle: data.data.tiktok_handle || ''
          })
          
          if (data.data.competitors && data.data.competitors.length > 0) {
            setCompetitors(data.data.competitors)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setError('Failed to load data. Please refresh the page.')
    } finally {
      setCheckingConnection(false)
    }
  }

  const handleConnectGAGSC = () => {
    window.location.href = `http://localhost:3010/api/auth/google?email=${encodeURIComponent(userEmail)}`
  }

  const handleSyncDomain = async () => {
    setSyncingDomain(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:3010/api/business-info/sync-domain-from-gsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBusinessInfo(prev => ({ ...prev, business_domain: data.domain }))
        alert(`✅ Domain synced successfully: ${data.domain}`)
      } else {
        setError(data.error || 'Failed to sync domain from Google Search Console')
      }
    } catch (error) {
      console.error('Error syncing domain:', error)
      setError('Failed to sync domain. Please try again.')
    } finally {
      setSyncingDomain(false)
    }
  }

  const handleSaveBusinessInfo = async () => {
    setSavingBusinessInfo(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:3010/api/business-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, ...businessInfo })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setEditingBusinessInfo(false)
        alert('✅ Business information saved successfully')
      } else {
        setError(data.error || 'Failed to save business information')
      }
    } catch (error) {
      console.error('Error saving business info:', error)
      setError('Failed to save business information. Please try again.')
    } finally {
      setSavingBusinessInfo(false)
    }
  }

  const handleAddCompetitor = async () => {
    if (!newCompetitor.domain) {
      setError('Competitor domain is required')
      return
    }
    
    if (!businessInfo.business_domain) {
      setError('Please sync your domain from Google Search Console first')
      return
    }
    
    setAddingCompetitor(true)
    setError('')
    
    try {
      const competitor = {
        id: Date.now().toString(),
        domain: newCompetitor.domain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        instagram: newCompetitor.instagram,
        facebook: newCompetitor.facebook,
        linkedin: newCompetitor.linkedin
      }
      
      const response = await fetch('http://localhost:3010/api/business-info/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, competitor })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadAllData(userEmail)
        setNewCompetitor({ domain: '', instagram: '', facebook: '', linkedin: '' })
        setShowAddCompetitor(false)
        alert('✅ Competitor added successfully')
      } else {
        setError(data.error || 'Failed to add competitor')
      }
    } catch (error) {
      console.error('Error adding competitor:', error)
      setError('Failed to add competitor. Please try again.')
    } finally {
      setAddingCompetitor(false)
    }
  }

  const handleRemoveCompetitor = async (competitorId: string) => {
    if (!confirm('Are you sure you want to remove this competitor?')) return
    
    try {
      const response = await fetch(
        `http://localhost:3010/api/business-info/competitors/${competitorId}?email=${encodeURIComponent(userEmail)}`,
        { method: 'DELETE' }
      )
      
      const data = await response.json()
      
      if (data.success) {
        await loadAllData(userEmail)
        
        if (selectedCompetitor?.id === competitorId) {
          setResults(null)
          setSelectedCompetitor(null)
          // Clear localStorage when removing the currently analyzed competitor
          localStorage.removeItem(`competitor_results_${userEmail}`)
          localStorage.removeItem(`selected_competitor_${userEmail}`)
        }
        
        alert('✅ Competitor removed successfully')
      } else {
        setError(data.error || 'Failed to remove competitor')
      }
    } catch (error) {
      console.error('Error removing competitor:', error)
      setError('Failed to remove competitor. Please try again.')
    }
  }

  const handleAnalyze = async (competitor: Competitor) => {
    if (!businessInfo.business_domain) {
      setError('Please sync your domain from Google Search Console first')
      return
    }
    
    setError('')
    setResults(null)
    setIsCached(false)
    setSelectedCompetitor(competitor)
    setLoading(true)
    
    try {
      const requestBody = {
        email: userEmail,
        yourSite: businessInfo.business_domain,
        competitorSite: competitor.domain,
        yourInstagram: businessInfo.instagram_handle || undefined,
        competitorInstagram: competitor.instagram || undefined,
        yourFacebook: businessInfo.facebook_handle || undefined,
        competitorFacebook: competitor.facebook || undefined,
        forceRefresh: false
      }
      
      console.log('🔍 Analyzing competitor:', requestBody)
      
      const response = await fetch('http://localhost:3010/api/competitor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const data = await response.json()
      
      if (data.success) {
        // Add timestamp for expiry checking
        const resultsWithTimestamp = {
          ...data,
          timestamp: Date.now()
        }
        
        setResults(resultsWithTimestamp)
        setIsCached(data.cached || false)
        
        // Save to localStorage for persistence across page reloads
        try {
          localStorage.setItem(`competitor_results_${userEmail}`, JSON.stringify(resultsWithTimestamp))
          localStorage.setItem(`selected_competitor_${userEmail}`, JSON.stringify(competitor))
          console.log('✅ Analysis complete and saved to localStorage:', data.cached ? 'from cache' : 'fresh')
        } catch (storageError) {
          console.warn('Failed to save to localStorage:', storageError)
        }
      } else {
        throw new Error(data.error || 'Analysis failed')
      }
    } catch (error: any) {
      console.error('Analysis error:', error)
      setError(`Analysis failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!results || !selectedCompetitor) return
    
    setDownloadingPDF(true)
    
    try {
      const response = await fetch('http://localhost:3010/api/competitor/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          yourSite: businessInfo.business_domain,
          competitorSite: selectedCompetitor.domain,
          results: results
        })
      })
      
      if (!response.ok) throw new Error('Failed to generate PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `competitor-analysis-${selectedCompetitor.domain}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setDownloadingPDF(false)
    }
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competitor Intelligence</h1>
          <p className="text-gray-600 mt-1">Comprehensive business and competitive analysis</p>
        </div>
        {businessInfo.business_domain && (
          <div className="flex-shrink-0 relative z-[10]">
            <Badge className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white border-0 px-3 py-1.5 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              {businessInfo.business_domain}
            </Badge>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="shadow-sm border border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-medium text-sm">Error</AlertTitle>
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-gray-900" />
              <div className="text-center">
                <p className="font-medium text-lg text-gray-900">Analyzing competitor...</p>
                <p className="text-sm text-gray-500 mt-1">This may take 10-30 seconds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="space-y-6">

        {/* Steps Section - Clean layout without z-index issues */}
        <div className="space-y-5">
          {/* Step 1: GA/GSC Connection */}
          <GAGSCConnectionCard
            gaGscConnected={gaGscConnected}
            checkingConnection={checkingConnection}
            syncingDomain={syncingDomain}
            hasDomain={!!businessInfo.business_domain}
            userEmail={userEmail}
            onConnect={handleConnectGAGSC}
            onSyncDomain={handleSyncDomain}
          />

          {/* Step 2: Business Information */}
          {gaGscConnected && (
            <BusinessInfoCard
              businessInfo={businessInfo}
              editingBusinessInfo={editingBusinessInfo}
              savingBusinessInfo={savingBusinessInfo}
              syncingDomain={syncingDomain}
              onEdit={() => setEditingBusinessInfo(true)}
              onCancel={() => setEditingBusinessInfo(false)}
              onSave={handleSaveBusinessInfo}
              onSyncDomain={handleSyncDomain}
              onChange={(field, value) => setBusinessInfo({ ...businessInfo, [field]: value })}
            />
          )}

          {/* Step 3: Competitors */}
          {businessInfo.business_domain && (
            <CompetitorsCard
              competitors={competitors}
              loading={loading}
              selectedCompetitorId={selectedCompetitor?.id}
              onAddClick={() => setShowAddCompetitor(true)}
              onAnalyze={handleAnalyze}
              onRemove={handleRemoveCompetitor}
            />
          )}
        </div>

        {/* Results Section - Professional styling */}
        {results && selectedCompetitor && (
          <div className="mt-6">
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg font-semibold text-gray-900">
                      📊 Analysis Results: <span className="text-gray-900">{selectedCompetitor.domain}</span>
                      {isCached && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          <Clock className="w-3 h-3 mr-1" />
                          Cached
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      Comparing <span className="font-medium text-gray-900">{businessInfo.business_domain}</span> vs <span className="font-medium text-gray-900">{selectedCompetitor.domain}</span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                      <SelectTrigger className="w-[140px] border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seo">SEO</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="ads">Advertising</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleDownloadPDF}
                      disabled={downloadingPDF}
                      variant="outline"
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                    >
                      {downloadingPDF ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <CompetitorResults
                  data={results}
                  analysisType={analysisType}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add Competitor Dialog */}
      <AddCompetitorDialog
        open={showAddCompetitor}
        loading={addingCompetitor}
        domain={newCompetitor.domain}
        instagram={newCompetitor.instagram}
        facebook={newCompetitor.facebook}
        linkedin={newCompetitor.linkedin}
        onOpenChange={setShowAddCompetitor}
        onChange={(field, value) => setNewCompetitor({ ...newCompetitor, [field]: value })}
        onAdd={handleAddCompetitor}
      />
    </div>
  )
}

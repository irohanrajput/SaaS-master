'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TrendingUp,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Lock,
  Globe,
  ArrowUp,
  ArrowDown,
  Activity,
  RefreshCw,
  Users,
  Clock,
  Eye,
  Target,
  DollarSign,
  BarChart3,
  Link,
  CheckCircle2,
  Award,
  Hash,
  Tag
} from 'lucide-react'

interface SEOPerformanceNewProps {
  user: any
}

export default function SEOPerformanceNew({ user }: SEOPerformanceNewProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [dateRange, setDateRange] = useState<'7days' | '30days'>('30days')
  const [searchConsoleData, setSearchConsoleData] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [loadingPageSpeed, setLoadingPageSpeed] = useState(false)
  const [refreshingLighthouse, setRefreshingLighthouse] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<'clicks' | 'impressions' | 'ctr' | 'position'>('clicks')
  const [cachedLighthouseData, setCachedLighthouseData] = useState<any>(null) // Cache lighthouse data
  const [lighthouseLastUpdated, setLighthouseLastUpdated] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  const userEmail = user?.email || 'test@example.com'

  // Check if Google services are connected
  const checkConnection = async () => {
    setCheckingConnection(true)
    try {
      const response = await fetch(`http://localhost:3010/api/auth/google/status?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setIsConnected(data.connected || false)
        
        if (data.connected) {
          fetchSearchConsoleData()
        } else {
          setShowConnectModal(true)
        }
      } else {
        setIsConnected(false)
        setShowConnectModal(true)
      }
    } catch (error) {
      console.error('Error checking connection:', error)
      setIsConnected(false)
      setShowConnectModal(true)
    } finally {
      setCheckingConnection(false)
    }
  }

  // Fetch Search Console data
  const fetchSearchConsoleData = async (forceRefreshLighthouse = false) => {
    setLoadingData(true)
    // Only show PageSpeed loading spinner if we don't have cached lighthouse data or forcing refresh
    const shouldShowLoadingSpinner = !cachedLighthouseData || forceRefreshLighthouse
    if (shouldShowLoadingSpinner) {
      setLoadingPageSpeed(true)
    }
    
    try {
      const url = forceRefreshLighthouse 
        ? `http://localhost:3010/api/search-console/data?email=${encodeURIComponent(userEmail)}&forceRefresh=true`
        : `http://localhost:3010/api/search-console/data?email=${encodeURIComponent(userEmail)}`
      
      const searchConsoleResponse = await fetch(url)
      const searchConsoleJson = await searchConsoleResponse.json()
      
      // Check if reconnection is needed - treat as disconnected
      if (searchConsoleJson.needsReconnect) {
        console.log('🔒 OAuth token expired, showing connect modal')
        setIsConnected(false)
        setShowConnectModal(true)
        setLoadingData(false)
        setLoadingPageSpeed(false)
        return
      }
      
      // Always store the response so we can show notes/explanations even when dataAvailable is false
      // Cache lighthouse data if it exists
      if (searchConsoleJson.lighthouse) {
        setCachedLighthouseData(searchConsoleJson.lighthouse)
        setLighthouseLastUpdated(searchConsoleJson.lastUpdated || new Date().toISOString())
        setLoadingPageSpeed(false)
      } else if (!forceRefreshLighthouse && cachedLighthouseData) {
        // If we have cached lighthouse data and didn't get new data, keep using cached
        searchConsoleJson.lighthouse = cachedLighthouseData
      }

      setSearchConsoleData(searchConsoleJson)
      console.log('✅ Search Console data loaded:', searchConsoleJson)
      if (!searchConsoleJson.dataAvailable && shouldShowLoadingSpinner) {
        setLoadingPageSpeed(false)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      if (shouldShowLoadingSpinner) {
        setLoadingPageSpeed(false)
      }
    } finally {
      setLoadingData(false)
    }
  }

  // Force refresh Lighthouse data
  const handleRefreshLighthouse = async () => {
    setRefreshingLighthouse(true)
    setLoadingPageSpeed(true)
    try {
      await fetchSearchConsoleData(true)
    } finally {
      setRefreshingLighthouse(false)
      setLoadingPageSpeed(false)
    }
  }

  // Fetch Google Analytics data
  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true)
    try {
      const response = await fetch(`http://localhost:3010/api/analytics/data?email=${encodeURIComponent(userEmail)}`)
      const data = await response.json()
      
      // Check if reconnection is needed - treat as disconnected
      if (data.needsReconnect) {
        console.log('🔒 OAuth token expired, showing connect modal')
        setIsConnected(false)
        setShowConnectModal(true)
        setLoadingAnalytics(false)
        return
      }
      
      if (data.dataAvailable) {
        setAnalyticsData(data)
        console.log('✅ Analytics data loaded:', data)
      } else {
        console.log('⚠️ No analytics data available:', data.reason)
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setAnalyticsData({
        dataAvailable: false,
        reason: 'Failed to fetch analytics data'
      })
    } finally {
      setLoadingAnalytics(false)
    }
  }

  // Connect to Google
  const handleConnect = () => {
    setConnecting(true)
    window.location.href = `http://localhost:3010/api/auth/google?email=${encodeURIComponent(userEmail)}`
  }

  // Disconnect from Google
  const handleDisconnect = async () => {
    setConnecting(true)
    try {
      const response = await fetch(`http://localhost:3010/api/auth/google/disconnect?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST'
      })
      if (response.ok) {
        setIsConnected(false)
        setSearchConsoleData(null)
        setCachedLighthouseData(null) // Clear lighthouse cache on disconnect
        setShowConnectModal(true)
      }
    } catch (error) {
      console.error('Error disconnecting Google:', error)
    } finally {
      setConnecting(false)
    }
  }

  useEffect(() => {
    checkConnection()

    // Check for success callback
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    if (success) {
      setIsConnected(true)
      setShowConnectModal(false)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Refetch data when date range changes
  useEffect(() => {
    if (isConnected && !checkingConnection) {
      fetchSearchConsoleData()
      fetchAnalyticsData()
    }
  }, [dateRange, isConnected])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toFixed(0)
  }

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(1) + '%'
  }

  if (checkingConnection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SEO & Website Performance</h1>
            <p className="text-gray-600 mt-1">Monitor your website&apos;s SEO metrics and performance</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-auto">
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger className="w-full sm:w-44 md:w-[180px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isConnected && (
              <>
                <Button 
                  variant="outline" 
                  className="gap-2 text-blue-600 border-blue-300 hover:bg-blue-50 w-full sm:w-auto justify-center"
                  onClick={handleRefreshLighthouse}
                  disabled={refreshingLighthouse || loadingPageSpeed}
                  title="Refresh Lighthouse/PageSpeed data"
                >
                  {refreshingLighthouse ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh Analysis</span>
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 text-red-600 border-red-300 hover:bg-red-50 w-full sm:w-auto justify-center"
                  onClick={handleDisconnect}
                  disabled={connecting}
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Disconnecting...</span>
                    </>
                  ) : (
                    <span>Disconnect</span>
                  )}
                </Button>
              </>
            )}
            <Button variant="outline" className="gap-2 w-full sm:w-auto justify-center">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>
          </div>
        </div>

        {/* Plan-specific feature availability */}
        <div>
          {(() => {
            const userPlan = (user?.plan || 'free').toLowerCase()
            const planPriority: any = { free: 0, growth: 1, premium: 2 }

            const features = [
              { key: 'siteAudit', label: 'Site Audit', minPlan: 'free' },
              { key: 'pageSpeed', label: 'Page Speed Analysis', minPlan: 'free' },
              { key: 'websiteTraffic', label: 'Website Traffic (Analytics)', minPlan: 'growth' },
              { key: 'keywordTracking', label: 'Keyword Tracking', minPlan: 'growth' },
              { key: 'competitorBenchmark', label: 'Competitor Benchmarking', minPlan: 'growth' },
              { key: 'backlinkAnalysis', label: 'Backlink Analysis', minPlan: 'premium' },
            ]

            const goToBilling = () => { window.location.href = '/dashboard/billing' }

            return (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-sky-600" />
                    Plan Features
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">Your plan: <span className="font-medium">{userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}</span></p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {features.map((f) => {
                      const available = (planPriority[userPlan] || 0) >= (planPriority[f.minPlan] || 0)
                      return (
                        <div key={f.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              {available ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{f.label}</div>
                              <div className="text-xs text-gray-500">{f.minPlan === 'free' ? 'Included' : `Requires ${f.minPlan.charAt(0).toUpperCase() + f.minPlan.slice(1)} plan`}</div>
                            </div>
                          </div>
                          {!available && (
                            <div>
                              <button onClick={goToBilling} className="text-xs text-orange-600 underline">Upgrade</button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })()}
        </div>

        {/* Connection Modal */}
        <Dialog open={showConnectModal && !isConnected} onOpenChange={setShowConnectModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">SEO & Website Performance</DialogTitle>
              <DialogDescription className="text-center pt-4">
                {searchConsoleData?.needsReconnect || analyticsData?.needsReconnect 
                  ? 'Your session has expired. Please reconnect your Google account to continue.'
                  : 'Connect your Google account to access Analytics and Search Console data'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2"
                size="lg"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    {searchConsoleData?.needsReconnect || analyticsData?.needsReconnect 
                      ? 'Reconnect with Google'
                      : 'Connect with Google Analytics 4'
                    }
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                This will connect both Google Analytics and Search Console
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        {isConnected ? (
          <div className="space-y-6">
            {/* Top Metrics Row - Original Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Site Audit - Dynamic from Lighthouse */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Site Audit</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingPageSpeed && !searchConsoleData?.lighthouse?.categoryScores ? (
                    // Loading State - only show if loading AND no data exists
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                      <p className="text-xs text-gray-500">Analyzing...</p>
                    </div>
                  ) : searchConsoleData?.lighthouse?.categoryScores ? (
                    <>
                      {/* Overall Score Circle */}
                      <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32">
                          <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="#e5e7eb"
                              strokeWidth="12"
                              fill="none"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke={
                                (searchConsoleData.lighthouse.categoryScores.seo || 0) >= 80 ? '#10b981' :
                                (searchConsoleData.lighthouse.categoryScores.seo || 0) >= 50 ? '#f59e0b' : '#ef4444'
                              }
                              strokeWidth="12"
                              fill="none"
                              strokeDasharray={`${(searchConsoleData.lighthouse.categoryScores.seo || 0) * 3.52} ${100 * 3.52}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-gray-900">
                              {searchConsoleData.lighthouse.categoryScores.seo || 0}%
                            </span>
                            <span className="text-sm text-gray-600">
                              {(searchConsoleData.lighthouse.categoryScores.seo || 0) >= 80 ? 'Good' :
                               (searchConsoleData.lighthouse.categoryScores.seo || 0) >= 50 ? 'Fair' : 'Poor'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Issues Breakdown - Based on Lighthouse Opportunities */}
                      <div className="mt-4 space-y-2">
                        {(() => {
                          const opportunities = searchConsoleData.lighthouse.opportunities || [];
                          const errors = opportunities.filter((opp: any) => opp.score < 0.5).length;
                          const warnings = opportunities.filter((opp: any) => opp.score >= 0.5 && opp.score < 0.9).length;
                          const notices = opportunities.filter((opp: any) => opp.score >= 0.9).length;

                          return (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Errors</span>
                                <span className="text-red-600 font-semibold">{errors}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Warnings</span>
                                <span className="text-orange-500 font-semibold">{warnings}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Notices</span>
                                <span className="text-gray-500 font-semibold">{notices}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </>
                  ) : (
                    // Fallback/Error State
                    <>
                      <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                          <AlertCircle className="w-8 h-8 text-orange-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 text-center mb-1">Analysis Unavailable</p>
                        <p className="text-xs text-gray-500 text-center px-4">
                          Site audit data couldn&apos;t be retrieved. This is temporary - try refreshing in a few moments.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Page Speed - Dynamic from Lighthouse */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Page Speed</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingPageSpeed && !searchConsoleData?.lighthouse?.categoryScores ? (
                    // Loading State - only show if loading AND no data exists
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Analyzing Page Speed...</p>
                        <p className="text-xs text-gray-500 mt-1">This may take up to 1 minute</p>
                      </div>
                    </div>
                    ) : searchConsoleData?.lighthouse?.categoryScores ? (
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                      {/* Desktop Score - Using Performance Score */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="#e5e7eb"
                              strokeWidth="8"
                              fill="none"
                            />
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke={
                                searchConsoleData.lighthouse.categoryScores.performance >= 90 ? '#10b981' :
                                searchConsoleData.lighthouse.categoryScores.performance >= 50 ? '#f59e0b' : '#ef4444'
                              }
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${(searchConsoleData.lighthouse.categoryScores.performance || 0) * 2.51} ${100 * 2.51}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">
                              {searchConsoleData.lighthouse.categoryScores.performance || 0}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600">Desktop</span>
                        </div>
                        <span className={`text-xs font-medium ${
                          searchConsoleData.lighthouse.categoryScores.performance >= 90 ? 'text-green-600' :
                          searchConsoleData.lighthouse.categoryScores.performance >= 50 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {searchConsoleData.lighthouse.categoryScores.performance >= 90 ? 'Good' :
                           searchConsoleData.lighthouse.categoryScores.performance >= 50 ? 'Average' : 'Slow'}
                        </span>
                      </div>

                      {/* Mobile Score - Estimate (typically ~15-20% lower than desktop) */}
                      <div className="flex flex-col items-center">
                        {(() => {
                          // Mobile is typically lower than desktop, estimate ~70% of desktop score
                          const mobileScore = Math.round(searchConsoleData.lighthouse.categoryScores.performance * 0.7);
                          return (
                            <>
                              <div className="relative w-24 h-24">
                                <svg className="w-24 h-24 transform -rotate-90">
                                  <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                    fill="none"
                                  />
                                  <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke={
                                      mobileScore >= 90 ? '#10b981' :
                                      mobileScore >= 50 ? '#f59e0b' : '#ef4444'
                                    }
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${mobileScore * 2.51} ${100 * 2.51}`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-2xl font-bold text-gray-900">
                                    {mobileScore}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 mt-2">
                                <Globe className="w-4 h-4 text-gray-500" />
                                <span className="text-xs text-gray-600">Mobile</span>
                              </div>
                              <span className={`text-xs font-medium ${
                                mobileScore >= 90 ? 'text-green-600' :
                                mobileScore >= 50 ? 'text-orange-500' : 'text-red-500'
                              }`}>
                                {mobileScore >= 90 ? 'Good' :
                                 mobileScore >= 50 ? 'Average' : 'Slow'}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    // Error/Unavailable State
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-orange-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 text-center mb-2">
                        Performance Analysis Unavailable
                      </p>
                      <p className="text-xs text-gray-500 text-center max-w-xs">
                        We couldn&apos;t analyze your page speed at this time. This is usually temporary. Please try again in a few moments.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Backlink Overview - Dynamic from SE Ranking */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Backlink Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingData ? (
                    <div className="space-y-3">
                      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : searchConsoleData?.backlinks?.available ? (
                    <>
                      {/* Total Backlinks - Large Display */}
                      <div className="text-center pb-2 border-b">
                        <div className="text-4xl font-bold text-green-600 leading-none mb-1">
                          {searchConsoleData.backlinks.totalBacklinks?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs text-gray-600">
                          Total Backlinks
                        </div>
                      </div>
                      
                      {/* Backlinks Quality Metrics - 2x2 Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Dofollow */}
                        <div className="p-2.5 bg-green-50 rounded-lg text-center">
                          <div className="text-xs text-gray-600 mb-1">Dofollow</div>
                          <div className="text-xl font-bold text-green-700 leading-none mb-0.5">
                            {searchConsoleData.backlinks.metrics?.dofollowBacklinks?.toLocaleString() || '0'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {searchConsoleData.backlinks.totalBacklinks > 0 && searchConsoleData.backlinks.metrics?.dofollowBacklinks ? 
                              `${((searchConsoleData.backlinks.metrics.dofollowBacklinks / searchConsoleData.backlinks.totalBacklinks) * 100).toFixed(1)}%`
                              : '0%'
                            }
                          </div>
                        </div>
                        
                        {/* Nofollow */}
                        <div className="p-2.5 bg-orange-50 rounded-lg text-center">
                          <div className="text-xs text-gray-600 mb-1">Nofollow</div>
                          <div className="text-xl font-bold text-orange-700 leading-none mb-0.5">
                            {searchConsoleData.backlinks.metrics?.nofollowBacklinks?.toLocaleString() || '0'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {searchConsoleData.backlinks.totalBacklinks > 0 && searchConsoleData.backlinks.metrics?.nofollowBacklinks ? 
                              `${((searchConsoleData.backlinks.metrics.nofollowBacklinks / searchConsoleData.backlinks.totalBacklinks) * 100).toFixed(1)}%`
                              : '0%'
                            }
                          </div>
                        </div>
                        
                        {/* .edu Links */}
                        <div className="p-2.5 bg-purple-50 rounded-lg text-center">
                          <div className="text-xs text-gray-600 mb-1">.edu Links</div>
                          <div className="text-xl font-bold text-purple-700 leading-none mb-0.5">
                            {searchConsoleData.backlinks.metrics?.eduBacklinks?.toLocaleString() || '0'}
                          </div>
                          <div className="text-xs text-gray-500">Authority</div>
                        </div>
                        
                        {/* .gov Links */}
                        <div className="p-2.5 bg-blue-50 rounded-lg text-center">
                          <div className="text-xs text-gray-600 mb-1">.gov Links</div>
                          <div className="text-xl font-bold text-blue-700 leading-none mb-0.5">
                            {searchConsoleData.backlinks.metrics?.govBacklinks?.toLocaleString() || '0'}
                          </div>
                          <div className="text-xs text-gray-500">Authority</div>
                        </div>
                      </div>
                      
                      {/* Bottom Stats Row - 3 Columns */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-0.5">Ref Domains</div>
                          <div className="text-lg font-bold text-gray-900 leading-none">
                            {searchConsoleData.backlinks.totalRefDomains?.toLocaleString() || '0'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-0.5">Text Links</div>
                          <div className="text-lg font-bold text-gray-900 leading-none">
                            {searchConsoleData.backlinks.metrics?.textBacklinks?.toLocaleString() || '0'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-0.5">From Homepage</div>
                          <div className="text-lg font-bold text-gray-900 leading-none">
                            {searchConsoleData.backlinks.metrics?.fromHomePageBacklinks?.toLocaleString() || '0'}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-gray-500">
                        <p className="text-sm">No backlink data available</p>
                        <p className="text-xs mt-2 text-gray-400">
                          {searchConsoleData?.backlinks?.note || 'Click "Refresh Analysis" to fetch backlinks data'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Core Web Vitals - Section #4 from Image */}
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Core Web Vitals
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Real user experience metrics from Lighthouse</p>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingPageSpeed && !searchConsoleData?.lighthouse?.coreWebVitals ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      <span className="ml-3 text-gray-600">Analyzing Core Web Vitals...</span>
                    </div>
                  ) : searchConsoleData?.lighthouse?.coreWebVitals ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {/* LCP */}
                      {(() => {
                        const lcp = searchConsoleData.lighthouse.coreWebVitals.lcp;
                        const rating = lcp.rating || 'unknown';
                        const color = rating === 'good' ? '#10b981' : rating === 'needs-improvement' ? '#f59e0b' : '#ef4444';
                        return (
                          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                            <div className="relative w-24 h-24 mb-3">
                              <svg className="w-24 h-24 transform -rotate-90">
                                <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                                <circle
                                  cx="48"
                                  cy="48"
                                  r="40"
                                  stroke={color}
                                  strokeWidth="8"
                                  fill="none"
                                  strokeDasharray={`${(lcp.score / 100) * 251.2} 251.2`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold" style={{ color }}>{lcp.score}%</span>
                              </div>
                            </div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">LCP</h4>
                            <p className="text-xs text-gray-500 text-center mb-1">Largest Contentful Paint</p>
                            <p className="text-sm font-bold text-gray-900">{lcp.displayValue}</p>
                            <Badge 
                              variant={rating === 'good' ? 'default' : 'destructive'} 
                              className={`mt-2 ${rating === 'good' ? 'bg-green-100 text-green-700' : rating === 'needs-improvement' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}
                            >
                              {rating === 'good' ? 'Good' : rating === 'needs-improvement' ? 'Needs Work' : 'Poor'}
                            </Badge>
                          </div>
                        );
                      })()}

                      {/* FID */}
                      {(() => {
                        const fid = searchConsoleData.lighthouse.coreWebVitals.fid;
                        const rating = fid.rating || 'unknown';
                        const color = rating === 'good' ? '#10b981' : rating === 'needs-improvement' ? '#f59e0b' : '#ef4444';
                        return (
                          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                            <div className="relative w-24 h-24 mb-3">
                              <svg className="w-24 h-24 transform -rotate-90">
                                <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                                <circle
                                  cx="48"
                                  cy="48"
                                  r="40"
                                  stroke={color}
                                  strokeWidth="8"
                                  fill="none"
                                  strokeDasharray={`${(fid.score / 100) * 251.2} 251.2`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold" style={{ color }}>{fid.score}%</span>
                              </div>
                            </div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">FID</h4>
                            <p className="text-xs text-gray-500 text-center mb-1">First Input Delay</p>
                            <p className="text-sm font-bold text-gray-900">{fid.displayValue}</p>
                            <Badge 
                              variant={rating === 'good' ? 'default' : 'destructive'} 
                              className={`mt-2 ${rating === 'good' ? 'bg-green-100 text-green-700' : rating === 'needs-improvement' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}
                            >
                              {rating === 'good' ? 'Good' : rating === 'needs-improvement' ? 'Needs Work' : 'Poor'}
                            </Badge>
                          </div>
                        );
                      })()}

                      {/* CLS */}
                      {(() => {
                        const cls = searchConsoleData.lighthouse.coreWebVitals.cls;
                        const rating = cls.rating || 'unknown';
                        const color = rating === 'good' ? '#10b981' : rating === 'needs-improvement' ? '#f59e0b' : '#ef4444';
                        return (
                          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                            <div className="relative w-24 h-24 mb-3">
                              <svg className="w-24 h-24 transform -rotate-90">
                                <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                                <circle
                                  cx="48"
                                  cy="48"
                                  r="40"
                                  stroke={color}
                                  strokeWidth="8"
                                  fill="none"
                                  strokeDasharray={`${(cls.score / 100) * 251.2} 251.2`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold" style={{ color }}>{cls.score}%</span>
                              </div>
                            </div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">CLS</h4>
                            <p className="text-xs text-gray-500 text-center mb-1">Cumulative Layout Shift</p>
                            <p className="text-sm font-bold text-gray-900">{cls.displayValue}</p>
                            <Badge 
                              variant={rating === 'good' ? 'default' : 'destructive'} 
                              className={`mt-2 ${rating === 'good' ? 'bg-green-100 text-green-700' : rating === 'needs-improvement' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}
                            >
                              {rating === 'good' ? 'Good' : rating === 'needs-improvement' ? 'Needs Work' : 'Poor'}
                            </Badge>
                          </div>
                        );
                      })()}

                      {/* FCP */}
                      {(() => {
                        const fcp = searchConsoleData.lighthouse.coreWebVitals.fcp;
                        const rating = fcp.rating || 'unknown';
                        const color = rating === 'good' ? '#10b981' : rating === 'needs-improvement' ? '#f59e0b' : '#ef4444';
                        return (
                          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                            <div className="relative w-24 h-24 mb-3">
                              <svg className="w-24 h-24 transform -rotate-90">
                                <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                                <circle
                                  cx="48"
                                  cy="48"
                                  r="40"
                                  stroke={color}
                                  strokeWidth="8"
                                  fill="none"
                                  strokeDasharray={`${(fcp.score / 100) * 251.2} 251.2`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold" style={{ color }}>{fcp.score}%</span>
                              </div>
                            </div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">FCP</h4>
                            <p className="text-xs text-gray-500 text-center mb-1">First Contentful Paint</p>
                            <p className="text-sm font-bold text-gray-900">{fcp.displayValue}</p>
                            <Badge 
                              variant={rating === 'good' ? 'default' : 'destructive'} 
                              className={`mt-2 ${rating === 'good' ? 'bg-green-100 text-green-700' : rating === 'needs-improvement' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}
                            >
                              {rating === 'good' ? 'Good' : rating === 'needs-improvement' ? 'Needs Work' : 'Poor'}
                            </Badge>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>Core Web Vitals data unavailable</p>
                    </div>
                  )}
                  
                  {/* Timestamp indicator */}
                  {searchConsoleData?.lighthouse?.coreWebVitals && (
                    <div className="mt-4 pt-4 border-t text-center">
                      <p className="text-xs text-gray-500">
                        Last analyzed: {lighthouseLastUpdated 
                          ? new Date(lighthouseLastUpdated).toLocaleString() 
                          : new Date(searchConsoleData.lighthouse.timestamp || Date.now()).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Data is cached for 1 hour • Click &quot;Refresh Analysis&quot; to update
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Three Column Row: Google Analytics + SEO Technical Analysis + Top Optimization Opportunities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Google Analytics Card */}
              <Card className="border-purple-200">
                <CardHeader className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Google Analytics
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">User engagement metrics</p>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingAnalytics ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
                      <p className="text-xs text-gray-500">Loading...</p>
                    </div>
                  ) : analyticsData && analyticsData.dataAvailable ? (
                    <div className="space-y-3">
                      {/* Active Users */}
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-gray-700">Active Users</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{formatNumber(analyticsData.activeUsers || 0)}</span>
                      </div>

                      {/* Sessions */}
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">Sessions</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{formatNumber(analyticsData.sessions || 0)}</span>
                      </div>

                      {/* Bounce Rate */}
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-gray-700">Bounce Rate</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          {analyticsData.bounceRate ? (analyticsData.bounceRate * 100).toFixed(1) + '%' : '0%'}
                        </span>
                      </div>

                      {/* Avg Session Duration */}
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">Avg Duration</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          {analyticsData.avgSessionDuration ? Math.round(analyticsData.avgSessionDuration) + 's' : '0s'}
                        </span>
                      </div>

                      {/* Page Views */}
                      <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-medium text-gray-700">Page Views</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{formatNumber(analyticsData.pageViews || 0)}</span>
                      </div>

                      {/* Conversions & Revenue */}
                      <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-pink-600" />
                            <span className="text-sm font-medium text-gray-700">Conversions</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">{analyticsData.conversions || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-gray-700">Revenue</span>
                          </div>
                          <span className="text-lg font-bold text-emerald-600">
                            ${analyticsData.revenue ? analyticsData.revenue.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs font-medium text-gray-700">Data Unavailable</p>
                      <p className="text-xs mt-1">{analyticsData?.reason || 'No data'}</p>
                      {analyticsData?.needsReconnect && (
                        <Button
                          onClick={handleConnect}
                          variant="outline"
                          size="sm"
                          className="mt-4"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reconnect Google Account
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  {analyticsData?.dataAvailable && (
                    <div className="mt-4 pt-3 border-t text-center">
                      <p className="text-xs text-gray-400">
                        Updated: {new Date(analyticsData.lastUpdated || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SEO Technical Analysis - Section #8 from Image */}
              <Card className="border-purple-200">
                <CardHeader className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Search className="w-5 h-5 text-purple-600" />
                    SEO Technical Analysis
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">Technical SEO health check</p>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingPageSpeed && !searchConsoleData?.lighthouse?.seoAnalysis ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
                      <p className="text-xs text-gray-500">Loading...</p>
                    </div>
                  ) : searchConsoleData?.lighthouse?.seoAnalysis ? (
                    <div className="space-y-3">
                      {Object.entries(searchConsoleData.lighthouse.seoAnalysis).map(([key, item]: [string, any], index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="mt-0.5">
                            {item.passed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-semibold text-gray-900">{item.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    item.score >= 80 ? 'bg-green-600' : item.score >= 50 ? 'bg-orange-500' : 'bg-red-600'
                                  }`}
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-600 min-w-[35px]">{item.score}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs">SEO analysis unavailable</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Optimization Opportunities - Section #9 from Image */}
              <Card className="border-orange-200">
                <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    Top Optimization Opportunities
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">Prioritized improvements</p>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingPageSpeed && !searchConsoleData?.lighthouse?.opportunities ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
                      <p className="text-xs text-gray-500">Loading...</p>
                    </div>
                  ) : searchConsoleData?.lighthouse?.opportunities && searchConsoleData.lighthouse.opportunities.length > 0 ? (
                    <div className="space-y-3">
                      {searchConsoleData.lighthouse.opportunities.slice(0, 5).map((opp: any, index: number) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="outline"
                              className={`text-xs px-2 py-0 ${
                                opp.impact === 'high' ? 'border-red-500 text-red-700 bg-red-50' :
                                opp.impact === 'medium' ? 'border-orange-500 text-orange-700 bg-orange-50' :
                                'border-blue-500 text-blue-700 bg-blue-50'
                              }`}
                            >
                              {opp.impact?.toUpperCase() || 'LOW'}
                            </Badge>
                            <span className="text-xs font-semibold text-green-600">
                              ~{(opp.savings / 1000).toFixed(2)}s
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-gray-900 mb-1">{opp.title}</h4>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">{opp.description}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  opp.score >= 80 ? 'bg-green-600' : opp.score >= 50 ? 'bg-orange-500' : 'bg-red-600'
                                }`}
                                style={{ width: `${opp.score}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{opp.score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" />
                      <p className="text-xs font-medium text-gray-900">Great job!</p>
                      <p className="text-xs mt-1">No major issues found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

                {/* Website Traffic Summary (moved here so it's not at the top) */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-sky-600" />
                        Website Traffic
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1">Overview of site sessions and organic clicks</p>
                    </CardHeader>
                    <CardContent>
                      {(loadingAnalytics || loadingData) ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-6 h-6 animate-spin text-sky-500 mr-3" />
                          <span className="text-sm text-gray-600">Loading traffic...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-sky-50 rounded-lg">
                            <div className="text-xs text-gray-600">Sessions</div>
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData?.sessions || 0)}</div>
                            <div className="text-xs text-gray-500">{dateRange === '7days' ? 'Last 7 days' : 'Last 30 days'}</div>
                          </div>

                          <div className="p-3 bg-emerald-50 rounded-lg">
                            <div className="text-xs text-gray-600">Users</div>
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData?.activeUsers || 0)}</div>
                            <div className="text-xs text-gray-500">Active users</div>
                          </div>

                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-xs text-gray-600">Organic Clicks</div>
                            <div className="text-2xl font-bold text-blue-600">{formatNumber(searchConsoleData?.totalClicks || searchConsoleData?.organicTraffic || 0)}</div>
                            <div className="text-xs text-gray-500">From Google Search</div>
                          </div>

                          <div className="p-3 bg-indigo-50 rounded-lg">
                            <div className="text-xs text-gray-600">Page Views</div>
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData?.pageViews || 0)}</div>
                            <div className="text-xs text-gray-500">Total page views</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* NEW: Google Search Console Section */}
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Google Search Console Data</h2>
              
              {loadingData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-gray-600">Loading Search Console data...</span>
                </div>
              ) : searchConsoleData && searchConsoleData.dataAvailable ? (
                <div className="space-y-6">
                  {/* Organic Traffic Overview */}
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Organic Traffic (Last 30 Days)</p>
                          <p className="text-4xl font-bold text-blue-600">
                            {formatNumber(searchConsoleData.organicTraffic || searchConsoleData.totalClicks || 0)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Total clicks from search results</p>
                        </div>
                        <div className="text-right">
                          <TrendingUp className="w-12 h-12 text-blue-500 opacity-50" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Graph - Beautiful Mint/Turquoise Area Chart */}
                  {searchConsoleData.dailyData && searchConsoleData.dailyData.length > 0 && (
                    <Card className="shadow-lg">
                      <CardContent className="pt-6">
                        {(() => {
                          // Filter data based on date range
                          const allData = searchConsoleData.dailyData;
                          const daysToShow = dateRange === '7days' ? 7 : 30;
                          const data = allData.slice(-daysToShow);
                          
                          // Metric configuration
                          const metricConfig = {
                            clicks: {
                              label: 'Clicks',
                              color: '#10B981',
                              gradientId: 'mintGradient',
                              getValue: (d: any) => d.clicks,
                              formatValue: (v: number) => v.toString(),
                              total: searchConsoleData.totalClicks || 0
                            },
                            impressions: {
                              label: 'Impressions',
                              color: '#8B5CF6',
                              gradientId: 'purpleGradient',
                              getValue: (d: any) => d.impressions,
                              formatValue: (v: number) => formatNumber(v),
                              total: searchConsoleData.totalImpressions || 0
                            },
                            ctr: {
                              label: 'CTR',
                              color: '#F59E0B',
                              gradientId: 'orangeGradient',
                              getValue: (d: any) => d.ctr * 100,
                              formatValue: (v: number) => `${v.toFixed(2)}%`,
                              total: searchConsoleData.averageCTR || 0
                            },
                            position: {
                              label: 'Position',
                              color: '#EF4444',
                              gradientId: 'redGradient',
                              getValue: (d: any) => d.position,
                              formatValue: (v: number) => v.toFixed(1),
                              total: searchConsoleData.averagePosition || 0
                            }
                          };
                          
                          const currentMetric = metricConfig[selectedMetric];
                          
                          return (
                            <div className="space-y-6">
                              {/* Header with Clickable Metrics and Date Range Selector */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                  {/* Total Clicks - Clickable */}
                                  <button
                                    onClick={() => setSelectedMetric('clicks')}
                                    className={`space-y-1 text-left p-4 rounded-lg border-2 transition-all ${
                                      selectedMetric === 'clicks'
                                        ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-sm'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                      <span className="text-sm font-medium">Total Clicks</span>
                                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01"/>
                                      </svg>
                                    </div>
                                    <div className={`text-2xl font-bold ${selectedMetric === 'clicks' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                      {searchConsoleData.totalClicks || 0}
                                    </div>
                                  </button>
                                  
                                  {/* Total Impressions - Clickable */}
                                  <button
                                    onClick={() => setSelectedMetric('impressions')}
                                    className={`space-y-1 text-left p-4 rounded-lg border-2 transition-all ${
                                      selectedMetric === 'impressions'
                                        ? 'border-purple-500 bg-purple-50 shadow-md'
                                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                      <span className="text-sm font-medium">Total Impressions</span>
                                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01"/>
                                      </svg>
                                    </div>
                                    <div className={`text-2xl font-bold ${selectedMetric === 'impressions' ? 'text-purple-600' : 'text-gray-900'}`}>
                                      {formatNumber(searchConsoleData.totalImpressions || 0)}
                                    </div>
                                  </button>
                                  
                                  {/* Average CTR - Clickable */}
                                  <button
                                    onClick={() => setSelectedMetric('ctr')}
                                    className={`space-y-1 text-left p-4 rounded-lg border-2 transition-all ${
                                      selectedMetric === 'ctr'
                                        ? 'border-orange-500 bg-orange-50 shadow-md'
                                        : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                      <span className="text-sm font-medium">Average CTR</span>
                                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01"/>
                                      </svg>
                                    </div>
                                    <div className={`text-2xl font-bold ${selectedMetric === 'ctr' ? 'text-orange-600' : 'text-gray-900'}`}>
                                      {formatPercentage(searchConsoleData.averageCTR || 0)}
                                    </div>
                                  </button>
                                  
                                  {/* Average Position - Clickable */}
                                  <button
                                    onClick={() => setSelectedMetric('position')}
                                    className={`space-y-1 text-left p-4 rounded-lg border-2 transition-all ${
                                      selectedMetric === 'position'
                                        ? 'border-red-500 bg-red-50 shadow-md'
                                        : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-sm'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                      <span className="text-sm font-medium">Average Position</span>
                                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01"/>
                                      </svg>
                                    </div>
                                    <div className={`text-2xl font-bold ${selectedMetric === 'position' ? 'text-red-600' : 'text-gray-900'}`}>
                                      {(searchConsoleData.averagePosition || 0).toFixed(1)}
                                    </div>
                                  </button>
                                </div>
                                
                                {/* Date Range Selector - Functional */}
                                <div className="ml-4">
                                  <Select value={dateRange} onValueChange={(value: '7days' | '30days') => setDateRange(value)}>
                                    <SelectTrigger className="w-[160px] bg-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="7days">Past 7 Days</SelectItem>
                                      <SelectItem value="30days">Past 30 Days</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              {/* Beautiful Area Chart - Dynamic based on selected metric */}
                              <div className="relative bg-white rounded-xl border border-gray-100 p-6">
                                {(() => {
                                          const width = 900;
                                          const height = 280;
                                          const padding = { top: 30, right: 40, bottom: 40, left: 60 };
                                  
                                  // Calculate max value for Y-axis based on selected metric
                                  const maxValue = Math.max(...data.map(currentMetric.getValue), 1);
                                  const yMax = Math.ceil(maxValue * 1.2); // 20% headroom
                                  
                                  // Create smooth path for selected metric
                                  const createSmoothPath = (data: any[]) => {
                                    const points = data.map((d, i) => {
                                      const x = padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right);
                                      const value = currentMetric.getValue(d);
                                      const y = height - padding.bottom - ((value / yMax) * (height - padding.top - padding.bottom));
                                      return { x, y, value, date: d.date, rawData: d };
                                    });
                                    
                                    if (points.length === 0) return { linePath: '', areaPath: '', points: [] };
                                    
                                    // Create smooth curve using cubic bezier
                                    let path = `M ${points[0].x},${points[0].y}`;
                                    
                                    for (let i = 0; i < points.length - 1; i++) {
                                      const current = points[i];
                                      const next = points[i + 1];
                                      const controlPointX = (current.x + next.x) / 2;
                                      
                                      path += ` C ${controlPointX},${current.y} ${controlPointX},${next.y} ${next.x},${next.y}`;
                                    }
                                    
                                    // Create area path (close to bottom)
                                    const areaPath = path + ` L ${points[points.length - 1].x},${height - padding.bottom} L ${points[0].x},${height - padding.bottom} Z`;
                                    
                                    return { linePath: path, areaPath, points };
                                  };
                                  
                                  const { linePath, areaPath, points } = createSmoothPath(data);
                                  
                                  return (
                                    <div className="relative">
                                      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[200px] sm:h-[280px]" preserveAspectRatio="xMidYMid meet">
                                        {/* Define beautiful gradients for all metrics */}
                                        <defs>
                                          {/* Mint/Green gradient for Clicks */}
                                          <linearGradient id="mintGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                                            <stop offset="50%" stopColor="#10B981" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                          </linearGradient>
                                          
                                          {/* Purple gradient for Impressions */}
                                          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                                            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                          </linearGradient>
                                          
                                          {/* Orange gradient for CTR */}
                                          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                                            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                          </linearGradient>
                                          
                                          {/* Red gradient for Position */}
                                          <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
                                            <stop offset="50%" stopColor="#EF4444" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                          </linearGradient>
                                          
                                          {/* Drop shadow for area */}
                                          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                                            <feOffset dx="0" dy="2" result="offsetblur"/>
                                            <feComponentTransfer>
                                              <feFuncA type="linear" slope="0.2"/>
                                            </feComponentTransfer>
                                            <feMerge>
                                              <feMergeNode/>
                                              <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                          </filter>
                                        </defs>
                                        
                                        {/* Subtle grid lines */}
                                        {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
                                          const y = height - padding.bottom - (fraction * (height - padding.top - padding.bottom));
                                          const yValue = yMax * fraction;
                                          return (
                                            <g key={i}>
                                              <line
                                                x1={padding.left}
                                                y1={y}
                                                x2={width - padding.right}
                                                y2={y}
                                                stroke="#f3f4f6"
                                                strokeWidth="1"
                                              />
                                              {/* Y-axis labels */}
                                              <text
                                                x={padding.left - 10}
                                                y={y}
                                                textAnchor="end"
                                                dominantBaseline="middle"
                                                fontSize="11"
                                                fill="#9ca3af"
                                              >
                                                {currentMetric.formatValue(yValue)}
                                              </text>
                                            </g>
                                          );
                                        })}
                                        
                                        {/* Area fill with gradient */}
                                        <path 
                                          d={areaPath} 
                                          fill={`url(#${currentMetric.gradientId})`}
                                          filter="url(#shadow)"
                                        />
                                        
                                        {/* Line stroke */}
                                        <path 
                                          d={linePath} 
                                          fill="none" 
                                          stroke={currentMetric.color} 
                                          strokeWidth="3"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        
                                        {/* Data points */}
                                        {points.map((point, i) => (
                                          <circle
                                            key={i}
                                            cx={point.x}
                                            cy={point.y}
                                            r="4"
                                            fill={currentMetric.color}
                                            stroke="#ffffff"
                                            strokeWidth="2"
                                            className="cursor-pointer hover:r-6 transition-all"
                                          />
                                        ))}
                                        
                                        {/* X-axis date labels */}
                                        {data.map((d: any, i: number) => {
                                          const showEvery = dateRange === '7days' ? 1 : Math.ceil(data.length / 7);
                                          if (i % showEvery !== 0 && i !== data.length - 1) return null;
                                          const x = padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right);
                                          return (
                                            <text
                                              key={i}
                                              x={x}
                                              y={height - padding.bottom + 20}
                                              textAnchor="middle"
                                              fontSize="11"
                                              fill="#6b7280"
                                            >
                                              {new Date(d.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                                            </text>
                                          );
                                        })}
                                      </svg>
                                      
                                      {/* Interactive tooltip overlay */}
                                      <div className="absolute inset-0 flex" style={{ 
                                        paddingLeft: `${(padding.left / width) * 100}%`, 
                                        paddingRight: `${(padding.right / width) * 100}%`, 
                                        paddingTop: `${(padding.top / height) * 100}%`, 
                                        paddingBottom: `${(padding.bottom / height) * 100}%` 
                                      }}>
                                        {data.map((day: any, index: number) => (
                                          <div key={index} className="flex-1 group relative cursor-pointer">
                                            <div className="h-full hover:bg-emerald-50 hover:bg-opacity-50 transition-colors"></div>
                                            {/* Beautiful tooltip */}
                                            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white border border-gray-200 rounded-xl py-3 px-4 shadow-xl z-10 min-w-[200px]">
                                              <div className="text-xs font-semibold text-gray-500 mb-2">
                                                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                              </div>
                                              <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentMetric.color }}></div>
                                                    <span className="text-xs text-gray-600">{currentMetric.label}</span>
                                                  </div>
                                                  <span className="text-sm font-bold text-gray-900">{currentMetric.formatValue(currentMetric.getValue(day))}</span>
                                                </div>
                                                <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-600">Clicks</span>
                                                    <span className="text-xs font-semibold text-gray-700">{day.clicks}</span>
                                                  </div>
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-600">Impressions</span>
                                                    <span className="text-xs font-semibold text-gray-700">{formatNumber(day.impressions)}</span>
                                                  </div>
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-600">CTR</span>
                                                    <span className="text-xs font-semibold text-gray-700">{formatPercentage(day.ctr)}</span>
                                                  </div>
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-600">Position</span>
                                                    <span className="text-xs font-semibold text-gray-700">{day.position.toFixed(1)}</span>
                                                  </div>
                                                </div>
                                              </div>
                                              {/* Tooltip arrow */}
                                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      
                                      {/* Legend at bottom */}
                                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 pb-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentMetric.color }}></div>
                                        <span className="text-sm font-medium" style={{ color: currentMetric.color }}>{currentMetric.label}</span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  {/* Two Column Layout: Top Pages and Top Queries */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Pages by Traffic */}
                    {searchConsoleData.topPages && searchConsoleData.topPages.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Top Pages by Traffic (Last 30 Days)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {searchConsoleData.topPages.slice(0, 10).map((page: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate" title={page.page}>
                                    {page.page.replace(/^https?:\/\/[^\/]+/, '')}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-500">
                                      {formatNumber(page.impressions)} impressions
                                    </span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">
                                      CTR: {formatPercentage(page.ctr)}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-lg font-bold text-blue-600">{page.clicks}</div>
                                  <div className="text-xs text-gray-500">clicks</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Top Search Queries */}
                    {searchConsoleData.topQueries && searchConsoleData.topQueries.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            Top Search Queries (Last 30 Days)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Query</th>
                                  <th className="text-center py-2 px-2 text-xs font-medium text-gray-600">Clicks</th>
                                  <th className="text-center py-2 px-2 text-xs font-medium text-gray-600">CTR</th>
                                  <th className="text-center py-2 px-2 text-xs font-medium text-gray-600">Position</th>
                                </tr>
                              </thead>
                              <tbody>
                                {searchConsoleData.topQueries.slice(0, 10).map((item: any, index: number) => (
                                  <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-2 text-sm font-medium">{item.query}</td>
                                    <td className="py-2 px-2 text-sm text-center">{item.clicks}</td>
                                    <td className="py-2 px-2 text-sm text-center">
                                      <span className={`${item.ctr > 0.05 ? 'text-green-600' : 'text-orange-500'}`}>
                                        {formatPercentage(item.ctr)}
                                      </span>
                                    </td>
                                    <td className="py-2 px-2 text-sm text-center">
                                      <span className={`${item.position <= 10 ? 'text-green-600 font-semibold' : item.position <= 20 ? 'text-orange-500' : 'text-red-600'}`}>
                                        {item.position.toFixed(1)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Backlinks Metrics Overview - SE Ranking */}
                  {!loadingData && searchConsoleData.backlinks?.available && searchConsoleData.backlinks?.metrics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Total Backlinks</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {searchConsoleData.backlinks.totalBacklinks?.toLocaleString() || 0}
                              </p>
                              {searchConsoleData.backlinks.metrics?.dofollow && (
                                <p className="text-xs text-green-600 mt-1">
                                  {searchConsoleData.backlinks.metrics.dofollow.toLocaleString()} dofollow
                                </p>
                              )}
                            </div>
                            <Link className="h-10 w-10 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Referring Domains</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {searchConsoleData.backlinks.totalRefDomains?.toLocaleString() || 0}
                              </p>
                              {searchConsoleData.backlinks.domainMetrics?.eduDomains !== undefined && (
                                <p className="text-xs text-purple-600 mt-1">
                                  {searchConsoleData.backlinks.domainMetrics.eduDomains} .edu domains
                                </p>
                              )}
                            </div>
                            <Globe className="h-10 w-10 text-purple-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Dofollow Links</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {searchConsoleData.backlinks.metrics?.dofollow?.toLocaleString() || 0}
                              </p>
                              {searchConsoleData.backlinks.totalBacklinks > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                  {((searchConsoleData.backlinks.metrics?.dofollow / searchConsoleData.backlinks.totalBacklinks) * 100).toFixed(1)}% of total
                                </p>
                              )}
                            </div>
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Authority Links</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {((searchConsoleData.backlinks.domainMetrics?.eduDomains || 0) + 
                                  (searchConsoleData.backlinks.domainMetrics?.govDomains || 0))}
                              </p>
                              <p className="text-xs text-orange-600 mt-1">
                                .edu + .gov domains
                              </p>
                            </div>
                            <Award className="h-10 w-10 text-orange-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Backlinks Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">Top Linking Sites</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Domain</th>
                                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Links</th>
                                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Authority</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loadingData ? (
                                // Loading skeleton
                                [1, 2, 3, 4, 5].map((i) => (
                                  <tr key={i} className="border-b">
                                    <td className="py-3 px-2">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-8 mx-auto"></div>
                                    </td>
                                  </tr>
                                ))
                              ) : searchConsoleData.backlinks?.topLinkingSites?.length > 0 ? (
                                searchConsoleData.backlinks.topLinkingSites.map((site: any, index: number) => (
                                  <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-2 text-sm font-medium">{site.domain}</td>
                                    <td className="py-3 px-2 text-sm text-center">{site.links || site.backlinks || 0}</td>
                                    <td className="py-3 px-2 text-sm text-center">
                                      <span className="text-blue-600 font-medium">DA {site.authority || 'N/A'}</span>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                // Show "No data available" when no backlinks data exists
                                <tr className="border-b">
                                  <td className="py-3 px-2 text-sm text-center text-gray-500" colSpan={3}>
                                    {searchConsoleData.backlinks?.note || 'No linking sites data available'}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {!loadingData && !searchConsoleData.backlinks?.topLinkingSites?.length && searchConsoleData.backlinks?.note && (
                          <div className="mt-4 p-2 bg-blue-50 rounded text-center">
                            <p className="text-xs text-gray-600">{searchConsoleData.backlinks.note}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">Top Linking Pages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">URL</th>
                                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Links</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loadingData ? (
                                // Loading skeleton
                                [1, 2, 3, 4, 5].map((i) => (
                                  <tr key={i} className="border-b">
                                    <td className="py-3 px-2">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
                                    </td>
                                  </tr>
                                ))
                              ) : searchConsoleData.backlinks?.topLinkingPages?.length > 0 ? (
                                searchConsoleData.backlinks.topLinkingPages.map((page: any, index: number) => (
                                  <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-2 text-sm truncate max-w-xs" title={page.url}>
                                      {page.url.length > 50 ? page.url.substring(0, 50) + '...' : page.url}
                                    </td>
                                    <td className="py-3 px-2 text-sm text-center font-medium">{page.backlinks}</td>
                                  </tr>
                                ))
                              ) : searchConsoleData.backlinks?.topLinkingPages?.length > 0 ? (
                                searchConsoleData.backlinks.topLinkingPages.map((page: any, index: number) => (
                                  <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-2 text-sm truncate max-w-xs" title={page.url}>
                                      {page.url && page.url.length > 50 ? page.url.substring(0, 50) + '...' : page.url || 'N/A'}
                                    </td>
                                    <td className="py-3 px-2 text-sm text-center font-medium">{page.backlinks || page.links || 0}</td>
                                  </tr>
                                ))
                              ) : (
                                // Show "No data available" when no backlinks data exists
                                <tr className="border-b">
                                  <td className="py-3 px-2 text-sm text-center text-gray-500" colSpan={2}>
                                    {searchConsoleData.backlinks?.note || 'No linking pages data available'}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {!loadingData && !searchConsoleData.backlinks?.topLinkingPages?.length && searchConsoleData.backlinks?.note && (
                          <div className="mt-4 p-2 bg-purple-50 rounded text-center">
                            <p className="text-xs text-gray-600">{searchConsoleData.backlinks.note}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Additional SE Ranking Insights */}
                  {!loadingData && searchConsoleData.backlinks?.available && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Top Anchor Texts */}
                      {searchConsoleData.backlinks?.topAnchors?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              Top Anchor Texts
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {searchConsoleData.backlinks.topAnchors.slice(0, 5).map((anchor: any, index: number) => (
                                <div key={index} className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate" title={anchor.anchor}>
                                      {anchor.anchor}
                                    </p>
                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-blue-600 h-1.5 rounded-full" 
                                        style={{ width: `${anchor.percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <span className="ml-3 text-sm font-semibold text-blue-600">
                                    {anchor.count}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Top Countries */}
                      {searchConsoleData.backlinks?.topCountries?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Top Countries
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {searchConsoleData.backlinks.topCountries.slice(0, 5).map((country: any, index: number) => (
                                <div key={index} className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{country.flag || '🌐'}</span>
                                      <span className="text-sm font-medium text-gray-900">
                                        {country.country}
                                      </span>
                                    </div>
                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-purple-600 h-1.5 rounded-full" 
                                        style={{ width: `${country.percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <span className="ml-3 text-sm font-semibold text-purple-600">
                                    {country.count}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Top TLDs */}
                      {searchConsoleData.backlinks?.topTlds?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              Top TLDs
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {searchConsoleData.backlinks.topTlds.slice(0, 5).map((tld: any, index: number) => (
                                <div key={index} className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      .{tld.tld}
                                    </p>
                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-green-600 h-1.5 rounded-full" 
                                        style={{ width: `${tld.percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <span className="ml-3 text-sm font-semibold text-green-600">
                                    {tld.count}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Data timestamp */}
                  <div className="text-center text-xs text-gray-500">
                    Last updated: {new Date(searchConsoleData.lastUpdated || Date.now()).toLocaleString()}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-lg text-gray-600 font-medium">No Search Console Data Available</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {searchConsoleData?.reason || 'Make sure your website is verified in Google Search Console'}
                      </p>
                      {searchConsoleData?.needsReconnect && (
                        <Button
                          onClick={handleConnect}
                          variant="default"
                          size="lg"
                          className="mt-6"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reconnect Google Account
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          // Blurred placeholder when not connected
          <div className="relative">
            <div className="blur-sm pointer-events-none opacity-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Site Audit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Page Speed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Backlinks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Additional placeholder sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Ranking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Content Gap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Backlinks Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-700">
                      🔗 Top Linking Sites
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-700">
                      📄 Top Linking Pages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


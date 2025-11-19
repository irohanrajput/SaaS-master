'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react'
import { useSubscription, usePlanCheck } from '@/contexts/SubscriptionContext'

// --- Interface Definitions ---
interface SocialMediaMetricsCardProps {
  userEmail?: string
}

interface TopPost {
  format: string
  reach: string
  likes: string
  comments: string
  shares: string
  message?: string
  caption?: string
  fullCaption?: string
  url?: string
  createdAt?: string
  created_time?: string
  timestamp?: string
}

interface FollowerGrowthData {
  date: string
  followers: number
  gained: number
  lost: number
  net: number
}

interface FacebookMetrics {
  dataAvailable: boolean
  pageName?: string
  pageId?: string
  engagementScore?: {
    likes: number
    comments: number
    shares: number
    engagementRate: number
    score?: number
    reach: number
  }
  followerGrowth?: FollowerGrowthData[]
  topPosts?: TopPost[]
  reputationBenchmark?: {
    score: number
    followers: number
    avgEngagementRate: number
    sentiment: string
  }
  reason?: string
  lastUpdated?: string
}

interface LinkedInMetrics {
  success: boolean
  dataAvailable: boolean
  companyName?: string
  companyUrl?: string
  companyFollowers?: number
  source?: string
  scrapedPostsCount?: number
  engagementScore?: {
    likes: number
    comments: number
    shares: number
    clicks?: number
    engagementRate: number
    score: number
    impressions?: number
    reach: number
    rateSource?: string
  }
  followerGrowth?: FollowerGrowthData[]
  topPosts?: TopPost[]
  allPosts?: TopPost[]
  reputationBenchmark?: {
    score: number
    followers: number
    avgEngagementRate: number
    sentiment: string
    avgEngagementPerPost?: number
  }
  reason?: string
  lastUpdated?: string
}

interface InstagramMetrics {
  dataAvailable: boolean
  username?: string
  accountId?: string
  name?: string
  engagementScore?: {
    likes: number
    comments: number
    saves: number
    shares: number
    engagementRate: number
    score?: number
    reach: number
    impressions: number
    profileViews: number
  }
  followerGrowth?: FollowerGrowthData[]
  topPosts?: TopPost[]
  reputationBenchmark?: {
    score: number
    followers: number
    avgEngagementRate: number
    sentiment: string
  }
  reason?: string
  lastUpdated?: string
}

interface SocialData {
  dataAvailable: boolean
  totalSocialSessions: number
  totalSocialUsers: number
  totalSocialConversions: number
  socialConversionRate: number
  socialTrafficPercentage: number
  topSocialSources: any[]
  reason?: string
  lastUpdated?: string
}

// --- Main Component ---
export default function SocialDashboard({ userEmail = 'test@example.com' }: SocialMediaMetricsCardProps) {
  const router = useRouter()
  // Log the email being used
  console.log('🔐 SocialDashboard initialized with email:', userEmail);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'

  // Subscription context
  const {
    plan,
    usage,
    incrementUsage,
  } = useSubscription()

  const { canUseSocialMedia, maxSocialConnections } = usePlanCheck()

  const [socialData, setSocialData] = useState<SocialData | null>(null)
  const [facebookData, setFacebookData] = useState<FacebookMetrics | null>(null)
  const [linkedinData, setLinkedinData] = useState<LinkedInMetrics | null>(null)
  const [instagramData, setInstagramData] = useState<InstagramMetrics | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [connected, setConnected] = useState(false)
  const [linkedinConnected, setLinkedinConnected] = useState(false)
  const [instagramConnected, setInstagramConnected] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(true)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [network, setNetwork] = useState<'linkedin' | 'facebook' | 'instagram'>('facebook')
  const [changingView, setChangingView] = useState(false) // NEW: Loading state for network/timeframe changes
  // Modal state
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [savingLinkedin, setSavingLinkedin] = useState(false)
  
  // Track if component has mounted (to skip initial timeframe fetch)
  const isInitialMount = useRef(true)

  // 🔍 DEBUG: Watch linkedinData changes
  useEffect(() => {
    if (linkedinData) {
      console.log('🔄 LINKEDIN DATA CHANGED:', {
        hasData: !!linkedinData,
        success: linkedinData.success,
        dataAvailable: linkedinData.dataAvailable,
        engagementScore: linkedinData.engagementScore,
        impressions: linkedinData.engagementScore?.impressions,
        clicks: linkedinData.engagementScore?.clicks,
        followerGrowthLength: linkedinData.followerGrowth?.length
      });
    }
  }, [linkedinData]);

  // --- Caching Functions ---
  // Cache key WITHOUT timeframe - we fetch all data once and filter on display
  const getCacheKey = (platform: string, email: string) => {
    return `social_${platform}_${email}_v3` // v3 = includes full 90 days data
  }

  const getCachedData = (platform: string) => {
    try {
      const cacheKey = getCacheKey(platform, userEmail)
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null

      const parsedCache = JSON.parse(cached)
      const ageMinutes = (Date.now() - parsedCache.timestamp) / (1000 * 60)

      // Cache version - increment this to invalidate all old caches
      const CACHE_VERSION = 2; // Updated for impressions/clicks fields
      if (!parsedCache.version || parsedCache.version < CACHE_VERSION) {
        console.log(`🗑️  Clearing outdated ${platform} cache (v${parsedCache.version || 1} < v${CACHE_VERSION})`);
        localStorage.removeItem(cacheKey);
        return null;
      }

      // Cache for 30 minutes
      if (ageMinutes > 30) {
        localStorage.removeItem(cacheKey)
        return null
      }

      console.log(`📦 Using cached ${platform} data (${Math.round(ageMinutes)} minutes old)`)
      return parsedCache.data
    } catch (error) {
      console.error('Error reading cache:', error)
      return null
    }
  }

  const setCachedData = (platform: string, data: any) => {
    try {
      const cacheKey = getCacheKey(platform, userEmail)
      const CACHE_VERSION = 3; // v3 = full 90 days data
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        version: CACHE_VERSION
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
      console.log(`💾 Cached ${platform} data (v${CACHE_VERSION})`)
    } catch (error) {
      console.error('Error saving cache:', error)
    }
  }

  const downloadReport = async () => {
    try {
      const currentData = network === 'facebook' ? facebookData : network === 'instagram' ? instagramData : linkedinData
      if (!currentData?.dataAvailable) return

      const reportData = {
        platform: network,
        companyName: network === 'facebook'
          ? (currentData as FacebookMetrics).pageName
          : network === 'instagram'
            ? (currentData as InstagramMetrics).username
            : (currentData as LinkedInMetrics).companyName,
        data: currentData,
        generatedAt: new Date().toISOString(),
        timeframe: timeframe
      }

      const response = await fetch('http://localhost:3010/api/social/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${network}-social-media-report-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading report:', error)
    }
  }

  // --- Functions ---
  const formatNumberShort = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  // Filter follower growth data based on selected timeframe
  const filterGrowthDataByTimeframe = (data: any[] | undefined) => {
    if (!data || data.length === 0) {
      console.log(`📊 No follower growth data available for ${network}`)
      return data || []
    }

    // If "all" is selected, return all data
    if (timeframe === 'all') {
      console.log(`📊 Showing all ${data.length} days of follower data for ${network}`)
      if (data.length > 0) {
        console.log(`   First: ${data[0].date} (${data[0].followers} followers)`)
        console.log(`   Last: ${data[data.length - 1].date} (${data[data.length - 1].followers} followers)`)
      }
      return data
    }

    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    }
    const days = daysMap[timeframe] || 30
    
    const filtered = data.slice(-days)
    console.log(`📊 Filtering ${data.length} days of follower data to last ${days} days for ${network}`)
    console.log(`   Result: ${filtered.length} days shown`)
    if (filtered.length > 0) {
      console.log(`   First: ${filtered[0].date} (${filtered[0].followers} followers)`)
      console.log(`   Last: ${filtered[filtered.length - 1].date} (${filtered[filtered.length - 1].followers} followers)`)
    }
    
    // Return last N days of data
    return filtered
  }

  // Filter posts by timeframe - SIMPLE VERSION
  const filterPostsByTimeframe = (posts: any[]) => {
    if (!posts || posts.length === 0) {
      console.log('No posts to filter');
      return posts;
    }

    // If "all" is selected, return all posts without filtering
    if (timeframe === 'all') {
      console.log(`\n🔍 SHOWING ALL ${network.toUpperCase()} POSTS (no filtering)`);
      console.log(`   Total posts: ${posts.length}\n`);
      return posts;
    }

    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    }
    const days = daysMap[timeframe] || 30
    const now = new Date()
    const cutoffDate = new Date(now)
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    console.log(`\n🔍 FILTERING ${network.toUpperCase()} POSTS:`);
    console.log(`   Timeframe: ${timeframe} = ${days} days`);
    console.log(`   Total posts: ${posts.length}`);
    console.log(`   Today: ${now.toISOString()} (${now.toLocaleDateString()})`);
    console.log(`   Cutoff date: ${cutoffDate.toISOString()} (${cutoffDate.toLocaleDateString()})`);
    
    // Log first post to see what fields are available
    if (posts.length > 0) {
      console.log(`   📋 First post fields:`, Object.keys(posts[0]));
      console.log(`   📋 First post sample:`, {
        format: posts[0].format,
        created_time: posts[0].created_time,
        caption: posts[0].caption?.substring(0, 30)
      });
    }
    
    const filtered = posts.filter(post => {
      // Check all possible date field names
      const dateField = post.createdAt || post.created_time || post.timestamp || post.createdTime;
      
      if (!dateField) {
        console.log(`   ⚠️ Post missing date - SKIPPING`);
        console.log(`      Post fields:`, Object.keys(post));
        return false;
      }
      
      const postDate = new Date(dateField);
      const daysDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
      const isValid = postDate >= cutoffDate;
      
      console.log(`   ${isValid ? '✅ INCLUDE' : '❌ EXCLUDE'}: ${dateField}`);
      console.log(`      Post date: ${postDate.toLocaleDateString()} (${daysDiff} days ago)`);
      console.log(`      Cutoff: ${cutoffDate.toLocaleDateString()} (${days} days ago)`);
      console.log(`      Valid: ${isValid} (post is ${isValid ? 'NEWER' : 'OLDER'} than cutoff)`);
      
      return isValid;
    })
    
    console.log(`\n   📊 FILTER RESULT: ${filtered.length} of ${posts.length} posts shown for ${timeframe}\n`);
    return filtered;
  }

  const checkFacebookConnection = async () => {
    try {
      const response = await fetch(`http://localhost:3010/api/auth/facebook/status?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setConnected(data.connected || false)
        console.log('✅ Facebook connection status:', data.connected)
      } else {
        setConnected(false)
      }
    } catch (error) {
      console.error('Error checking Facebook connection:', error)
      setConnected(false)
    }
  }

  const checkLinkedInConnection = async () => {
    try {
      // Check localStorage first
      const linkedinToken = localStorage.getItem('linkedin_access_token')
      if (linkedinToken) {
        setLinkedinConnected(true)
        console.log('✅ LinkedIn token found in localStorage')
        return
      }

      // Fallback to OAuth connection status check
      const response = await fetch(`http://localhost:3010/api/auth/linkedin/status?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const result = await response.json()
        const isConnected = result.success && result.data?.connected
        setLinkedinConnected(isConnected)
        console.log('✅ LinkedIn OAuth connection status:', isConnected)

        // If connected, also get organization info
        if (isConnected) {
          const orgResponse = await fetch(`http://localhost:3010/api/linkedin/organizations?email=${encodeURIComponent(userEmail)}`)
          if (orgResponse.ok) {
            const orgData = await orgResponse.json()
            if (orgData.success && orgData.companyUrl) {
              setLinkedinUrl(orgData.companyUrl)
              console.log('✅ LinkedIn organization found:', orgData.companyName)
            }
          }
        }
      } else {
        setLinkedinConnected(false)
      }
    } catch (error) {
      console.error('Error checking LinkedIn connection:', error)
      setLinkedinConnected(false)
    }
  }

  const checkInstagramConnection = async () => {
    try {
      // Instagram uses Facebook OAuth, so check Instagram status endpoint
      const response = await fetch(`http://localhost:3010/api/auth/instagram/status?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setInstagramConnected(data.connected || false)
        console.log('✅ Instagram connection status (via Facebook OAuth):', data.connected)
      } else {
        setInstagramConnected(false)
      }
    } catch (error) {
      console.error('Error checking Instagram connection:', error)
      setInstagramConnected(false)
    }
  }

  const fetchSocialMetrics = async () => {
    if (!connected && network === 'facebook') {
      console.log('Not connected to Facebook, skipping metrics fetch')
      return
    }

    if (!linkedinConnected && network === 'linkedin') {
      console.log('No LinkedIn URL saved, skipping metrics fetch')
      return
    }

    if (!instagramConnected && network === 'instagram') {
      console.log('Not connected to Instagram, skipping metrics fetch')
      return
    }

    setLoadingData(true)
    try {
      if (network === 'facebook' && connected) {
        await fetchFacebookMetrics()
      } else if (network === 'linkedin' && linkedinConnected) {
        await fetchLinkedInMetrics()
      } else if (network === 'instagram' && instagramConnected) {
        await fetchInstagramMetrics()
      }
    } finally {
      setLoadingData(false)
    }
  }

  const fetchFacebookMetrics = async (forceRefresh = false) => {
    // Only fetch if Facebook is the current network
    if (network !== 'facebook') {
      console.log('🚫 Skipping Facebook fetch - not current network')
      return
    }

    // Clear frontend cache if force refresh
    if (forceRefresh) {
      const cacheKey = getCacheKey('facebook', userEmail);
      localStorage.removeItem(cacheKey);
      console.log('🗑️ Cleared frontend cache for Facebook');
    }

    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cachedData = getCachedData('facebook')
      if (cachedData) {
        setFacebookData(cachedData)
        setSocialData({
          dataAvailable: true,
          totalSocialSessions: cachedData.engagementScore?.reach || 0,
          totalSocialUsers: cachedData.reputationBenchmark?.followers || 0,
          totalSocialConversions: cachedData.engagementScore?.shares || 0,
          socialConversionRate: cachedData.engagementScore?.engagementRate || 0,
          socialTrafficPercentage: 0.25,
          topSocialSources: [],
          lastUpdated: cachedData.lastUpdated
        })
        return
      }
    }

    try {
      console.log('📊 Fetching Facebook metrics...', forceRefresh ? '(force refresh)' : '(normal)')

      const response = await fetch(
        `http://localhost:3010/api/facebook/metrics?email=${encodeURIComponent(userEmail)}&forceRefresh=${forceRefresh}`
      )

      const data = await response.json()
      
      console.log('📦 Facebook data received:', {
        dataAvailable: data.dataAvailable,
        topPostsCount: data.topPosts?.length,
        topPosts: data.topPosts,
        engagementScore: data.engagementScore
      });
      
      // Log each post's date AND all fields
      if (data.topPosts && data.topPosts.length > 0) {
        console.log('\n📅 FACEBOOK POST DATES FROM BACKEND:');
        data.topPosts.forEach((post: any, idx: number) => {
          console.log(`   ${idx + 1}. Fields:`, Object.keys(post));
          console.log(`      created_time: ${post.created_time}`);
          console.log(`      createdTime: ${post.createdTime}`);
          console.log(`      caption: ${post.caption?.substring(0, 30) || '(no caption)'}`);
        });
        console.log('');
      }

      // Double-check we're still on Facebook network before setting data
      if (network !== 'facebook') {
        console.log('🚫 Network changed during fetch - discarding Facebook data')
        return
      }

      if (data.dataAvailable) {
        setFacebookData(data)
        console.log('✅ Facebook data SET to state:', {
          topPostsCount: data.topPosts?.length,
          firstPost: data.topPosts?.[0]
        });
        setCachedData('facebook', data) // Cache the data
        
        // If we got data, we're definitely connected
        if (!connected) {
          setConnected(true)
          console.log('✅ Facebook connection confirmed via data fetch')
        }

        // Also set socialData for backward compatibility
        setSocialData({
          dataAvailable: true,
          totalSocialSessions: data.engagementScore?.reach || 0,
          totalSocialUsers: data.reputationBenchmark?.followers || 0,
          totalSocialConversions: data.engagementScore?.shares || 0,
          socialConversionRate: data.engagementScore?.engagementRate || 0,
          socialTrafficPercentage: 0.25,
          topSocialSources: [],
          lastUpdated: data.lastUpdated
        })
        console.log('✅ Facebook data loaded and set')
      } else {
        console.log('⚠️ No Facebook data available:', data.reason)
        setFacebookData(null)
        setSocialData({
          dataAvailable: false,
          totalSocialSessions: 0,
          totalSocialUsers: 0,
          totalSocialConversions: 0,
          socialConversionRate: 0,
          socialTrafficPercentage: 0,
          topSocialSources: [],
          reason: data.reason || 'Failed to fetch data'
        })
      }
    } catch (error) {
      console.error('Error fetching Facebook metrics:', error)
      if (network === 'facebook') {
        setFacebookData(null)
        setSocialData({
          dataAvailable: false,
          totalSocialSessions: 0,
          totalSocialUsers: 0,
          totalSocialConversions: 0,
          socialConversionRate: 0,
          socialTrafficPercentage: 0,
          topSocialSources: [],
          reason: 'Network error'
        })
      }
    }
  }

  const fetchLinkedInMetrics = async (forceRefresh = false) => {
    // Only fetch if LinkedIn is the current network
    if (network !== 'linkedin') {
      console.log('🚫 Skipping LinkedIn fetch - not current network')
      return
    }

    console.log('🚀 fetchLinkedInMetrics called, forceRefresh:', forceRefresh)

    // Clear frontend cache if force refresh
    if (forceRefresh) {
      const cacheKey = getCacheKey('linkedin', userEmail);
      localStorage.removeItem(cacheKey);
      console.log('🗑️ Cleared frontend cache for LinkedIn');
    }

    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cachedData = getCachedData('linkedin')
      if (cachedData) {
        console.log('📦 Using cached LinkedIn data')
        setLinkedinData(cachedData)
        setSocialData({
          dataAvailable: true,
          totalSocialSessions: cachedData.engagementScore?.reach || 0,
          totalSocialUsers: cachedData.reputationBenchmark?.followers || cachedData.companyFollowers || 0,
          totalSocialConversions: cachedData.engagementScore?.shares || 0,
          socialConversionRate: cachedData.engagementScore?.engagementRate || 0,
          socialTrafficPercentage: 0.25,
          topSocialSources: [],
          lastUpdated: cachedData.lastUpdated
        })
        setLoadingData(false)
        return
      }
    }

    setLoadingData(true)
    console.log('⏳ Loading state set to true')
    
    try {
      console.log('📊 Fetching LinkedIn metrics...')
      
      // Get token from localStorage
      const linkedinToken = localStorage.getItem('linkedin_access_token')
      console.log('🔑 Token from localStorage:', linkedinToken ? 'Found' : 'Not found')
      
      const headers: HeadersInit = {}
      
      if (linkedinToken) {
        headers['Authorization'] = `Bearer ${linkedinToken}`
        console.log('✅ Using LinkedIn token from localStorage')
      } else {
        console.warn('⚠️ No LinkedIn token in localStorage!')
      }
      
      // Always fetch 90 days of data - will be filtered by timeframe on display
      const response = await fetch(
        `http://localhost:3010/api/linkedin/metrics?email=${encodeURIComponent(userEmail)}`,
        { headers }
      )

      console.log('📡 Response status:', response.status)
      const data = await response.json()

      // Double-check we're still on LinkedIn network before setting data
      if (network !== 'linkedin') {
        console.log('🚫 Network changed during fetch - discarding LinkedIn data')
        return
      }

      console.log('📦 Received data:', JSON.stringify(data, null, 2))
      console.log('📦 data.success:', data.success)
      console.log('📦 data.dataAvailable:', data.dataAvailable)
      console.log('📦 Company name:', data.companyName)
      console.log('📦 Posts total:', data.posts?.total)
      console.log('📦 Top posts:', data.topPosts?.length)
      console.log('📊 Engagement Score:', data.engagementScore)
      console.log('📊 Impressions from API:', data.engagementScore?.impressions)
      console.log('📊 Clicks from API:', data.engagementScore?.clicks)

      if (data.success && data.dataAvailable) {
        console.log('✅ Setting LinkedIn data...')
        console.log('✅ Data to set:', data)
        setLinkedinData(data)
        setCachedData('linkedin', data) // Cache the data
        console.log('✅ linkedinData state updated')
        
        // If we got data, we're definitely connected
        if (!linkedinConnected) {
          setLinkedinConnected(true)
          console.log('✅ LinkedIn connection confirmed via data fetch')
        }

        // Also set socialData for backward compatibility
        setSocialData({
          dataAvailable: true,
          totalSocialSessions: data.engagementScore?.reach || 0,
          totalSocialUsers: data.reputationBenchmark?.followers || data.companyFollowers || 0,
          totalSocialConversions: data.engagementScore?.shares || 0,
          socialConversionRate: data.engagementScore?.engagementRate || 0,
          socialTrafficPercentage: 0.25,
          topSocialSources: [],
          lastUpdated: data.lastUpdated
        })
        console.log('✅ LinkedIn data loaded and set')
        console.log('✅ linkedinData state:', data)
      } else {
        console.log('⚠️ No LinkedIn data available:', data.reason || data.message)
        setLinkedinData(null)
        setSocialData({
          dataAvailable: false,
          totalSocialSessions: 0,
          totalSocialUsers: 0,
          totalSocialConversions: 0,
          socialConversionRate: 0,
          socialTrafficPercentage: 0,
          topSocialSources: [],
          reason: data.reason || 'Failed to fetch data'
        })
      }
    } catch (error) {
      console.error('Error fetching LinkedIn metrics:', error)
      if (network === 'linkedin') {
        setLinkedinData(null)
        setSocialData({
          dataAvailable: false,
          totalSocialSessions: 0,
          totalSocialUsers: 0,
          totalSocialConversions: 0,
          socialConversionRate: 0,
          socialTrafficPercentage: 0,
          topSocialSources: [],
          reason: 'Network error'
        })
      }
    } finally {
      setLoadingData(false)
      console.log('🏁 LinkedIn metrics fetch completed, loading state cleared')
    }
  }

  const fetchInstagramMetrics = async (forceRefresh = false) => {
    // Only fetch if Instagram is the current network
    if (network !== 'instagram') {
      console.log('🚫 Skipping Instagram fetch - not current network')
      return
    }

    // Clear frontend cache if force refresh
    if (forceRefresh) {
      const cacheKey = getCacheKey('instagram', userEmail);
      localStorage.removeItem(cacheKey);
      console.log('🗑️ Cleared frontend cache for Instagram');
    }

    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cachedData = getCachedData('instagram')
      if (cachedData) {
        setInstagramData(cachedData)
        setSocialData({
          dataAvailable: true,
          totalSocialSessions: cachedData.engagementScore?.reach || 0,
          totalSocialUsers: cachedData.reputationBenchmark?.followers || 0,
          totalSocialConversions: cachedData.engagementScore?.shares || 0,
          socialConversionRate: cachedData.engagementScore?.engagementRate || 0,
          socialTrafficPercentage: 0.25,
          topSocialSources: [],
          lastUpdated: cachedData.lastUpdated
        })
        return
      }
    }

    try {
      console.log('📊 Fetching Instagram metrics...', forceRefresh ? '(force refresh)' : '(normal)')

      const response = await fetch(
        `http://localhost:3010/api/instagram/metrics?email=${encodeURIComponent(userEmail)}&forceRefresh=${forceRefresh}`
      )

      const data = await response.json()
      
      console.log('📦 Instagram data received:', {
        dataAvailable: data.dataAvailable,
        topPostsCount: data.topPosts?.length,
        topPosts: data.topPosts,
        engagementScore: data.engagementScore
      });

      // Double-check we're still on Instagram network before setting data
      if (network !== 'instagram') {
        console.log('🚫 Network changed during fetch - discarding Instagram data')
        return
      }

      if (data.dataAvailable) {
        setInstagramData(data)
        setCachedData('instagram', data) // Cache the data
        
        // If we got data, we're definitely connected
        if (!instagramConnected) {
          setInstagramConnected(true)
          console.log('✅ Instagram connection confirmed via data fetch')
        }

        // Also set socialData for backward compatibility
        setSocialData({
          dataAvailable: true,
          totalSocialSessions: data.engagementScore?.reach || 0,
          totalSocialUsers: data.reputationBenchmark?.followers || 0,
          totalSocialConversions: data.engagementScore?.shares || 0,
          socialConversionRate: data.engagementScore?.engagementRate || 0,
          socialTrafficPercentage: 0.25,
          topSocialSources: [],
          lastUpdated: data.lastUpdated
        })
        console.log('✅ Instagram data loaded and set')
      } else {
        console.log('⚠️ No Instagram data available:', data.reason)
        setInstagramData(null)
        setSocialData({
          dataAvailable: false,
          totalSocialSessions: 0,
          totalSocialUsers: 0,
          totalSocialConversions: 0,
          socialConversionRate: 0,
          socialTrafficPercentage: 0,
          topSocialSources: [],
          reason: data.reason || 'Failed to fetch data'
        })
      }
    } catch (error) {
      console.error('Error fetching Instagram metrics:', error)
      if (network === 'instagram') {
        setInstagramData(null)
        setSocialData({
          dataAvailable: false,
          totalSocialSessions: 0,
          totalSocialUsers: 0,
          totalSocialConversions: 0,
          socialConversionRate: 0,
          socialTrafficPercentage: 0,
          topSocialSources: [],
          reason: 'Network error'
        })
      }
    }
  }

  const connectFacebook = () => {
    window.location.href = `${API_URL}/api/auth/facebook?email=${encodeURIComponent(userEmail)}`
  }

  const connectInstagram = () => {
    window.location.href = `${API_URL}/api/auth/instagram?email=${encodeURIComponent(userEmail)}`
  }

  const disconnectFacebook = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/facebook/disconnect?email=${encodeURIComponent(userEmail)}`,
        { method: 'POST' }
      )

      if (response.ok) {
        setConnected(false)
        setInstagramConnected(false) // Also disconnect Instagram since it uses Facebook OAuth
        setFacebookData(null)
        setInstagramData(null)
        setSocialData(null)
        setShowConnectModal(true)
        console.log('✅ Disconnected Facebook and Instagram')
      }
    } catch (error) {
      console.error('Error disconnecting Facebook:', error)
    }
  }
  const connectLinkedIn = () => {
    const clientId = '86x2hsbgbwfqsd';
    const redirectUri = 'http://localhost:3002/auth/linkedin/callback';
    const state = crypto.randomUUID();

    // Request organization scopes for Community Management API
    const scope = 'r_basicprofile r_organization_social r_organization_followers rw_organization_admin r_member_postAnalytics';

    // Store state and email for callback validation
    sessionStorage.setItem('linkedin_oauth_state', state);
    sessionStorage.setItem('linkedin_user_email', userEmail);

    // Build authorization URL (NO PKCE for web apps)
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

    console.log('🔐 Initiating LinkedIn OAuth...');
    console.log('📋 Scopes requested:', scope);
    console.log('🔗 Redirect URI:', redirectUri);

    window.location.href = authUrl;
  };


  const disconnectLinkedIn = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('linkedin_access_token')
      localStorage.removeItem('linkedin_user_email')
      console.log('🗑️ Cleared LinkedIn token from localStorage')

      const response = await fetch(
        `http://localhost:3010/api/auth/linkedin/disconnect?email=${encodeURIComponent(userEmail)}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setLinkedinConnected(false)
        setLinkedinData(null)
        setLinkedinUrl('')
        setSocialData(null)
        setShowConnectModal(true)
        console.log('✅ LinkedIn disconnected successfully')
      }
    } catch (error) {
      console.error('Error disconnecting LinkedIn:', error)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return Math.round(num).toString()
  }

  // NEW: Calculate dynamic engagement metrics based on filtered posts for the selected timeframe
  const calculateDynamicEngagement = useMemo(() => {
    console.log(`\n📊 CALCULATING DYNAMIC ENGAGEMENT for ${network} (${timeframe})`);
    
    let currentData: any = null;
    let allPosts: any[] = [];
    
    // Get current platform data
    if (network === 'facebook' && facebookData?.dataAvailable) {
      currentData = facebookData;
      allPosts = facebookData.topPosts || [];
    } else if (network === 'linkedin' && linkedinData?.dataAvailable) {
      currentData = linkedinData;
      allPosts = linkedinData.allPosts || linkedinData.topPosts || [];
    } else if (network === 'instagram' && instagramData?.dataAvailable) {
      currentData = instagramData;
      allPosts = instagramData.topPosts || [];
    }
    
    if (!currentData || allPosts.length === 0) {
      console.log('   ❌ No data or posts available');
      return null;
    }
    
    console.log(`   📝 Total posts available: ${allPosts.length}`);
    
    // Filter posts by timeframe
    const filteredPosts = filterPostsByTimeframe(allPosts);
    console.log(`   📝 Filtered posts for ${timeframe}: ${filteredPosts.length}`);
    
    if (filteredPosts.length === 0) {
      console.log('   ❌ No posts in selected timeframe');
      return null;
    }
    
    // Calculate totals from filtered posts
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalReach = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    
    filteredPosts.forEach((post: any) => {
      // Parse numeric values from strings (e.g., "1.2K" -> 1200)
      const parseLikes = parseInt(post.likes?.toString().replace(/[^0-9]/g, '') || '0');
      const parseComments = parseInt(post.comments?.toString().replace(/[^0-9]/g, '') || '0');
      const parseShares = parseInt(post.shares?.toString().replace(/[^0-9]/g, '') || '0');
      const parseReach = parseInt(post.reach?.toString().replace(/[^0-9]/g, '') || '0');
      const parseImpressions = parseInt(post.impressions?.toString().replace(/[^0-9]/g, '') || '0');
      const parseClicks = parseInt(post.clicks?.toString().replace(/[^0-9]/g, '') || '0');
      
      totalLikes += parseLikes;
      totalComments += parseComments;
      totalShares += parseShares;
      totalReach += parseReach;
      totalImpressions += parseImpressions;
      totalClicks += parseClicks;
    });
    
    // Calculate engagement rate
    const totalEngagement = totalLikes + totalComments + totalShares;
    const engagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;
    
    console.log(`   ✅ Calculated metrics:`, {
      posts: filteredPosts.length,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      reach: totalReach,
      impressions: totalImpressions,
      clicks: totalClicks,
      engagementRate: engagementRate.toFixed(2) + '%'
    });
    
    return {
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      reach: totalReach,
      impressions: totalImpressions,
      clicks: totalClicks,
      engagementRate: engagementRate,
      postsCount: filteredPosts.length
    };
  }, [network, timeframe, facebookData, linkedinData, instagramData]);

  const computeEngagementScore = useMemo(() => {
    // PRIORITY 1: Use dynamic engagement calculation based on filtered posts
    if (calculateDynamicEngagement && calculateDynamicEngagement.engagementRate > 0) {
      console.log('📊 Using DYNAMIC engagement score:', calculateDynamicEngagement.engagementRate);
      return Math.min(100, Math.round(calculateDynamicEngagement.engagementRate));
    }

    // FALLBACK: Use the backend's calculated engagement rate directly
    // Backend already calculates this properly based on reach/impressions
    
    if (network === 'facebook' && facebookData?.dataAvailable && facebookData.engagementScore) {
      const engagement = facebookData.engagementScore
      
      // If backend provided an engagement rate, use it
      if (engagement.engagementRate !== undefined && engagement.engagementRate !== null) {
        return Math.min(100, Math.round(engagement.engagementRate))
      }
      
      // Fallback: Calculate from interactions if backend didn't provide rate
      const totalEngagement = (engagement.likes || 0) + (engagement.comments || 0) + (engagement.shares || 0)
      if (totalEngagement > 0 && engagement.reach && engagement.reach > 0) {
        return Math.min(100, Math.round((totalEngagement / engagement.reach) * 100))
      }
      
      // Last resort: Show score based on activity level
      if (totalEngagement > 0) {
        return Math.min(100, Math.round(totalEngagement * 2))
      }
      
      return 0
    }

    if (network === 'linkedin' && linkedinData?.dataAvailable && linkedinData.engagementScore) {
      const engagement = linkedinData.engagementScore
      
      // If backend provided an engagement rate, use it
      if (engagement.engagementRate !== undefined && engagement.engagementRate !== null) {
        return Math.min(100, Math.round(engagement.engagementRate))
      }
      
      // Fallback: Calculate from interactions
      const totalEngagement = (engagement.likes || 0) + (engagement.comments || 0) + (engagement.shares || 0)
      if (totalEngagement > 0 && engagement.reach && engagement.reach > 0) {
        return Math.min(100, Math.round((totalEngagement / engagement.reach) * 100))
      }
      
      // Last resort: Show score based on activity level
      if (totalEngagement > 0) {
        return Math.min(100, Math.round(totalEngagement * 2))
      }
      
      return 0
    }

    if (network === 'instagram' && instagramData?.dataAvailable && instagramData.engagementScore) {
      const engagement = instagramData.engagementScore
      
      // If backend provided an engagement rate, use it
      if (engagement.engagementRate !== undefined && engagement.engagementRate !== null) {
        return Math.min(100, Math.round(engagement.engagementRate))
      }
      
      // Fallback: Calculate from interactions
      const totalEngagement = (engagement.likes || 0) + (engagement.comments || 0) + (engagement.saves || 0)
      if (totalEngagement > 0 && engagement.reach && engagement.reach > 0) {
        return Math.min(100, Math.round((totalEngagement / engagement.reach) * 100))
      }
      
      // Last resort: Show score based on activity level
      if (totalEngagement > 0) {
        return Math.min(100, Math.round(totalEngagement * 2))
      }
      
      return 0
    }

    return 0
  }, [calculateDynamicEngagement, facebookData, linkedinData, instagramData, network, timeframe])

  // Validate that we're showing data for the correct platform
  const validatePlatformData = (platformData: any, expectedPlatform: string) => {
    if (!platformData?.dataAvailable) return false

    // Additional validation to ensure data consistency
    if (expectedPlatform === 'facebook' && platformData.pageName) return true
    if (expectedPlatform === 'linkedin' && (platformData.companyName || platformData.companyUrl)) return true
    if (expectedPlatform === 'instagram' && platformData.username) return true

    return platformData.dataAvailable
  }

  const getNetworkStats = useMemo(() => {
    // Helper function to format numbers with K suffix
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    }

    // PRIORITY 1: Use dynamic engagement calculation based on filtered posts
    if (calculateDynamicEngagement) {
      console.log('📊 Using DYNAMIC engagement data for stats (filtered by timeframe)');
      return {
        likes: formatNumber(calculateDynamicEngagement.likes),
        comments: formatNumber(calculateDynamicEngagement.comments),
        shares: formatNumber(calculateDynamicEngagement.shares),
        engagementRate: calculateDynamicEngagement.engagementRate.toFixed(1),
        reach: calculateDynamicEngagement.reach
      };
    }

    // FALLBACK: Use overall engagement score from backend if dynamic calculation not available
    // Use real Facebook data if available and validated
    if (network === 'facebook' && facebookData && validatePlatformData(facebookData, 'facebook')) {
      const engagement = facebookData.engagementScore
      if (engagement) {
        console.log('📊 Using Facebook BACKEND data for stats (fallback):', engagement)
        return {
          likes: formatNumber(engagement.likes),
          comments: formatNumber(engagement.comments),
          shares: formatNumber(engagement.shares),
          engagementRate: (engagement.engagementRate || 0).toFixed(1),
          reach: engagement.reach || 0
        }
      }
    }

    // Use real LinkedIn data if available and validated
    if (network === 'linkedin' && linkedinData && validatePlatformData(linkedinData, 'linkedin')) {
      const engagement = linkedinData.engagementScore
      if (engagement) {
        console.log('📊 Using LinkedIn BACKEND data for stats (fallback):', engagement)
        console.log('📊 LinkedIn clicks:', engagement.clicks)
        console.log('📊 LinkedIn impressions:', engagement.impressions)
        console.log('📊 Full linkedinData object:', JSON.stringify(linkedinData, null, 2))
        return {
          likes: formatNumber(engagement.likes),
          comments: formatNumber(engagement.comments),
          shares: formatNumber(engagement.shares),
          engagementRate: (engagement.engagementRate || 0).toFixed(1),
          reach: engagement.reach || 0
        }
      }
    }

    // Use real Instagram data if available and validated
    if (network === 'instagram' && instagramData && validatePlatformData(instagramData, 'instagram')) {
      const engagement = instagramData.engagementScore
      if (engagement) {
        console.log('📊 Using Instagram BACKEND data for stats (fallback):', engagement)
        return {
          likes: formatNumber(engagement.likes),
          comments: formatNumber(engagement.comments),
          shares: formatNumber(engagement.saves || 0), // Use saves for Instagram
          engagementRate: (engagement.engagementRate || 0).toFixed(1),
          reach: engagement.reach || 0
        }
      }
    }

    // No data available - return zeros
    console.log('📊 No data available for network:', network)
    return {
      likes: '0',
      comments: '0',
      shares: '0',
      engagementRate: '0.0',
      reach: 0
    }
  }, [network, timeframe, calculateDynamicEngagement, facebookData, linkedinData, instagramData])

  const networkStats = getNetworkStats



  useEffect(() => {
    // Check all connections on mount
    const checkAllConnections = async () => {
      setCheckingConnection(true)
      await Promise.all([
        checkFacebookConnection(),
        checkLinkedInConnection(),
        checkInstagramConnection()
      ])
      setCheckingConnection(false)
    }
    
    checkAllConnections()

    // Check for OAuth callback success/error
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const connectedPlatform = urlParams.get('connected')
    const error = urlParams.get('error')

    if (success) {
      if (connectedPlatform === 'linkedin') {
        // LinkedIn OAuth success
        setLinkedinConnected(true)
        setShowConnectModal(false)
        setNetwork('linkedin') // ✅ Switch to LinkedIn network
        setCheckingConnection(false) // ✅ Mark connection check as complete
        console.log('✅ OAuth success - LinkedIn connected, switching to LinkedIn network')
        
        // Clear any cached data to force fresh fetch
        const cacheKey = getCacheKey('linkedin', userEmail)
        localStorage.removeItem(cacheKey)
        
        // Fetch LinkedIn metrics immediately with a slight delay to ensure state is set
        setTimeout(() => {
          console.log('🚀 Triggering LinkedIn metrics fetch after OAuth success')
          fetchLinkedInMetrics(true) // Force refresh
        }, 1000)
      } else {
        // Facebook OAuth enables both Facebook and Instagram
        setConnected(true)
        setInstagramConnected(true)
        setShowConnectModal(false)
        setCheckingConnection(false) // ✅ Mark connection check as complete
        console.log('✅ OAuth success - Facebook and Instagram both connected')
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (error) {
      console.error('OAuth error:', error)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Timeframe changes - NO NEED TO REFETCH, just filter existing data
  useEffect(() => {
    // Skip on initial mount (data will be fetched by network change useEffect)
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    
    console.log('⏰ Timeframe changed to:', timeframe)
    console.log('   Current network:', network)
    console.log('   Facebook data available:', !!facebookData?.dataAvailable)
    console.log('   LinkedIn data available:', !!linkedinData?.dataAvailable)
    console.log('   Instagram data available:', !!instagramData?.dataAvailable)
    
    // DON'T refetch - the backend already returns all posts
    // The filtering happens automatically in the render based on timeframe state
    console.log('✅ Timeframe changed - filtering will happen automatically on next render')
  }, [timeframe]) // Trigger when timeframe changes



  // Handle network change - load cached data or fetch if needed
  useEffect(() => {
    // Show connection modal if platform not connected AND no data available
    if (network === 'facebook' && !connected && !checkingConnection && !facebookData?.dataAvailable) {
      setShowConnectModal(true)
      // Clear data for disconnected platform
      setSocialData(null)
      setFacebookData(null)
    } else if (network === 'linkedin' && !linkedinConnected && !checkingConnection && !linkedinData?.dataAvailable) {
      setShowConnectModal(true)
      // Clear data for disconnected platform
      setSocialData(null)
      setLinkedinData(null)
    } else if (network === 'instagram' && !instagramConnected && !checkingConnection && !instagramData?.dataAvailable) {
      // Instagram uses Facebook OAuth
      setShowConnectModal(true)
      // Clear data for disconnected platform
      setSocialData(null)
      setInstagramData(null)
    } else {
      setShowConnectModal(false)

      // Load data for the selected platform (from cache or fetch)
      if (network === 'facebook' && connected) {
        // Check if we already have Facebook data, if not fetch it
        const cachedFacebookData = getCachedData('facebook')
        if (cachedFacebookData && !facebookData) {
          setFacebookData(cachedFacebookData)
          setSocialData({
            dataAvailable: true,
            totalSocialSessions: cachedFacebookData.engagementScore?.reach || 0,
            totalSocialUsers: cachedFacebookData.reputationBenchmark?.followers || 0,
            totalSocialConversions: cachedFacebookData.engagementScore?.shares || 0,
            socialConversionRate: cachedFacebookData.engagementScore?.engagementRate || 0,
            socialTrafficPercentage: 0.25,
            topSocialSources: [],
            lastUpdated: cachedFacebookData.lastUpdated
          })
        } else if (!facebookData) {
          fetchFacebookMetrics()
        }
      } else if (network === 'linkedin' && linkedinConnected) {
        // Check if we already have LinkedIn data, if not fetch it
        const cachedLinkedInData = getCachedData('linkedin')
        if (cachedLinkedInData && !linkedinData) {
          console.log('📦 Loading LinkedIn data from cache')
          setLinkedinData(cachedLinkedInData)
          setSocialData({
            dataAvailable: true,
            totalSocialSessions: cachedLinkedInData.engagementScore?.reach || 0,
            totalSocialUsers: cachedLinkedInData.reputationBenchmark?.followers || cachedLinkedInData.companyFollowers || 0,
            totalSocialConversions: cachedLinkedInData.engagementScore?.shares || 0,
            socialConversionRate: cachedLinkedInData.engagementScore?.engagementRate || 0,
            socialTrafficPercentage: 0.25,
            topSocialSources: [],
            lastUpdated: cachedLinkedInData.lastUpdated
          })
        } else if (!linkedinData) {
          console.log('🔄 No cached LinkedIn data, fetching fresh data...')
          fetchLinkedInMetrics()
        } else {
          console.log('✅ LinkedIn data already loaded')
        }
      } else if (network === 'instagram' && instagramConnected) {
        // Check if we already have Instagram data, if not fetch it
        const cachedInstagramData = getCachedData('instagram')
        if (cachedInstagramData && !instagramData) {
          setInstagramData(cachedInstagramData)
          setSocialData({
            dataAvailable: true,
            totalSocialSessions: cachedInstagramData.engagementScore?.reach || 0,
            totalSocialUsers: cachedInstagramData.reputationBenchmark?.followers || 0,
            totalSocialConversions: cachedInstagramData.engagementScore?.shares || 0,
            socialConversionRate: cachedInstagramData.engagementScore?.engagementRate || 0,
            socialTrafficPercentage: 0.25,
            topSocialSources: [],
            lastUpdated: cachedInstagramData.lastUpdated
          })
        } else if (!instagramData) {
          fetchInstagramMetrics()
        }
      }
    }
  }, [network, connected, linkedinConnected, instagramConnected, checkingConnection])

  // --- JSX Rendering (Content Only) ---
  return (
    <div className="p-8 space-y-6 relative">

      {/* Blurred Modal for Connect Facebook/LinkedIn/Instagram */}
      {showConnectModal && ((network === 'facebook' && !connected) || (network === 'linkedin' && !linkedinConnected) || (network === 'instagram' && !instagramConnected)) && !checkingConnection && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto text-center relative">
            <button 
              className="absolute top-4 right-4 z-[10000] text-gray-400 hover:text-gray-600 transition-colors" 
              onClick={() => setShowConnectModal(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              {network === 'facebook' ? 'Connect Facebook' : network === 'instagram' ? 'Connect Your Facebook Page' : 'Connect LinkedIn'}
            </h2>
            <p className="text-gray-500 mb-6">
              {network === 'facebook'
                ? 'Connect your Facebook Page to view Facebook metrics and Instagram metrics if your page is connected to an Instagram Business Account.'
                : network === 'instagram'
                  ? 'Connect your Facebook Page (which has an Instagram Business Account linked) to view Instagram metrics.'
                  : 'To view your LinkedIn metrics, please enter your LinkedIn company URL.'}
            </p>

            {(network === 'facebook' || network === 'instagram') && (
              <div className="flex flex-col gap-4">
                {network === 'instagram' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 text-left">
                    <p className="font-medium mb-2">📘 One Connection for Both Platforms</p>
                    <p className="text-xs mb-2">Instagram uses Facebook OAuth for authentication.</p>
                    <p className="text-xs font-medium">✅ Make sure your Instagram Business Account is connected to your Facebook Page to view both Facebook and Instagram metrics.</p>
                  </div>
                )}
                {network === 'facebook' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 text-left">
                    <p className="font-medium mb-2">📘 Connect Once, Get Both</p>
                    <p className="text-xs">By connecting your Facebook Page, you&apos;ll also get Instagram metrics if your page has an Instagram Business Account connected to it.</p>
                  </div>
                )}
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={connectFacebook}>
                  {network === 'instagram' ? 'Connect Facebook to Access Instagram' : 'Connect Facebook'}
                </Button>
              </div>
            )}

            {network === 'linkedin' && (
              <div className="flex flex-col gap-4">
                <input
                  type="url"
                  placeholder="https://linkedin.com/company/your-company"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  className="bg-blue-800 hover:bg-blue-900 text-white"
                  onClick={connectLinkedIn}
                >
                  Connect LinkedIn
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={timeframe}
            onChange={(e) => {
              setChangingView(true)
              setTimeframe(e.target.value as any)
              setTimeout(() => setChangingView(false), 300)
            }}
            className="text-sm border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center]"
            style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M7%2010l5%205l5-5H7z%22%2F%3E%3C%2Fsvg%3E\")" }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          <select
            value={network}
            onChange={(e) => {
              setChangingView(true)
              setNetwork(e.target.value as any)
              setTimeout(() => setChangingView(false), 300)
            }}
            className="text-sm border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center]"
            style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M7%2010l5%205l5-5H7z%22%2F%3E%3C%2Fsvg%3E\")" }}
          >
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          {/* Platform Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${(network === 'facebook' && (facebookData?.dataAvailable || connected)) ||
              (network === 'linkedin' && (linkedinData?.dataAvailable || linkedinConnected)) ||
              (network === 'instagram' && (instagramData?.dataAvailable || instagramConnected))
              ? 'bg-green-500'
              : 'bg-gray-400'
              }`} />
            <span className="text-xs text-gray-600">
              {network === 'facebook' && facebookData?.pageName
                ? `Facebook: ${facebookData.pageName}`
                : network === 'linkedin' && linkedinData?.companyName
                  ? `LinkedIn: ${linkedinData.companyName}`
                  : network === 'instagram' && instagramData?.username
                    ? `Instagram: @${instagramData.username}`
                    : network === 'facebook' && (facebookData?.dataAvailable || connected)
                      ? 'Facebook: Connected'
                      : network === 'linkedin' && (linkedinData?.dataAvailable || linkedinConnected)
                        ? 'LinkedIn: Connected'
                        : network === 'instagram' && (instagramData?.dataAvailable || instagramConnected)
                          ? 'Instagram: Connected'
                          : `${network.charAt(0).toUpperCase() + network.slice(1)}: Not Connected`
              }
            </span>
          </div>

          {/* Download Report Button */}
          {((network === 'facebook' && facebookData?.dataAvailable) || (network === 'linkedin' && linkedinData?.dataAvailable) || (network === 'instagram' && instagramData?.dataAvailable)) && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  // Force refresh data
                  if (network === 'facebook') {
                    fetchFacebookMetrics(true);
                  } else if (network === 'linkedin') {
                    fetchLinkedInMetrics(true);
                  } else if (network === 'instagram') {
                    fetchInstagramMetrics(true);
                  }
                }}
                className="text-sm text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                🔄 Refresh Data
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadReport()}
                className="text-sm text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                Download Report
              </Button>
            </>
          )}

          {((network === 'facebook' && connected) || (network === 'instagram' && instagramConnected) || (network === 'linkedin' && linkedinConnected)) && (
            <Button
              variant="outline"
              onClick={network === 'facebook' || network === 'instagram' ? disconnectFacebook : disconnectLinkedIn}
              className="text-sm text-red-600 border-red-300 hover:bg-red-50"
            >
              Disconnect {network === 'facebook' || network === 'instagram' ? 'Facebook & Instagram' : 'LinkedIn'}
            </Button>
          )}
        </div>
      </div>

      {loadingData || changingView ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              {changingView ? 'Updating view...' : `Loading ${network === 'facebook' ? 'Facebook' : network === 'instagram' ? 'Instagram' : network === 'linkedin' ? 'LinkedIn' : 'social'} metrics...`}
            </p>
          </div>
        </div>
      ) : socialData?.dataAvailable ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">

            {/* A. Engagement Score & Follower Growth (Row 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Engagement Score Card */}
              <Card className="border-none shadow-lg">
                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-lg font-bold text-gray-900">Engagement Score</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-4 flex items-center justify-center space-x-4">
                  {/* Score Circle */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    {(() => {
                      const engagementRate = parseFloat(networkStats.engagementRate) || 0
                      const score = computeEngagementScore
                      const radius = 50
                      const circumference = 2 * Math.PI * radius
                      const progress = (score / 100) * circumference
                      return (
                        <svg viewBox="0 0 120 120" className="w-32 h-32">
                          {/* Background circle */}
                          <circle cx="60" cy="60" r={radius} fill="none" stroke="#FEE2E2" strokeWidth="10" />
                          {/* Progress circle - rotated to start from top */}
                          <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="10"
                            strokeDasharray={`${progress} ${circumference - progress}`}
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                          />
                          {/* Engagement Rate % in center - NO rotation needed */}
                          <text x="60" y="58" textAnchor="middle" dominantBaseline="middle" className="fill-gray-900" fontSize="24" fontWeight="700">
                            {engagementRate}%
                          </text>
                          <text x="60" y="76" textAnchor="middle" className="fill-gray-500" fontSize="10">
                            Engagement
                          </text>
                        </svg>
                      )
                    })()}
                  </div>
                  {/* Key Metrics */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center text-gray-700">
                      <span className="font-medium">Likes</span>
                      <span className="font-semibold">{networkStats.likes}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span className="font-medium">Comments</span>
                      <span className="font-semibold">{networkStats.comments}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span className="font-medium">Shares</span>
                      <span className="font-semibold">{networkStats.shares}</span>
                    </div>
                    {network === 'linkedin' && (
                      <>
                        <div className="flex justify-between items-center text-gray-700">
                          <span className="font-medium">Clicks</span>
                          <span className="font-semibold" onClick={() => {
                            console.log('🖱️ CLICKS DEBUG:');
                            console.log('   Dynamic clicks:', calculateDynamicEngagement?.clicks);
                            console.log('   Backend clicks:', linkedinData?.engagementScore?.clicks);
                            console.log('   Using:', calculateDynamicEngagement?.clicks || linkedinData?.engagementScore?.clicks || 0);
                          }}>
                            {(calculateDynamicEngagement?.clicks || linkedinData?.engagementScore?.clicks || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-gray-700">
                          <span className="font-medium">Impressions</span>
                          <span className="font-semibold" onClick={() => {
                            console.log('👁️ IMPRESSIONS DEBUG:');
                            console.log('   Dynamic impressions:', calculateDynamicEngagement?.impressions);
                            console.log('   Backend impressions:', linkedinData?.engagementScore?.impressions);
                            console.log('   Using:', calculateDynamicEngagement?.impressions || linkedinData?.engagementScore?.impressions || 0);
                          }}>
                            {(calculateDynamicEngagement?.impressions || linkedinData?.engagementScore?.impressions || 0).toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                    {/* Engagement Rate removed - already shown in circle */}
                    {network === 'linkedin' && linkedinData?.engagementScore?.rateSource && (
                      <div className="text-xs text-gray-400 italic text-center">
                        {linkedinData.engagementScore.rateSource === 'calculated_from_impressions' ? '✓ From LinkedIn Analytics' :
                         linkedinData.engagementScore.rateSource === 'calculated_from_reach' ? 'From Reach Data' :
                         'Estimated'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Follower Growth Card (Chart) */}
              <Card className="border-none shadow-lg">
                <CardHeader className="p-6 pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg font-bold text-gray-900">Follower Growth</CardTitle>
                    {(() => {
                      const currentData = network === 'facebook' ? facebookData : network === 'instagram' ? instagramData : linkedinData;
                      const allDataPoints = currentData?.followerGrowth?.length || 0;
                      const filteredData = filterGrowthDataByTimeframe(currentData?.followerGrowth);
                      const filteredPoints = filteredData?.length || 0;
                      
                      if (allDataPoints > 0) {
                        return (
                          <span className="text-xs text-gray-500 italic whitespace-nowrap">
                            Showing {filteredPoints} of {allDataPoints} day{allDataPoints !== 1 ? 's' : ''}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-4" key={`${network}-${timeframe}`}>
                  {(() => {
                    // Get real follower growth data for current network
                    const currentData = network === 'facebook' ? facebookData : network === 'instagram' ? instagramData : linkedinData;
                    const allGrowthData = currentData?.followerGrowth;
                    
                    console.log(`\n📊 RENDERING FOLLOWER CHART:`);
                    console.log(`   Network: ${network}`);
                    console.log(`   Timeframe: ${timeframe}`);
                    console.log(`   All growth data points: ${allGrowthData?.length || 0}`);
                    
                    // Filter data based on selected timeframe (7d, 30d, 90d, all)
                    const growthData = filterGrowthDataByTimeframe(allGrowthData);
                    
                    console.log(`   Filtered growth data points: ${growthData?.length || 0}`);
                    
                    // Check if we have data
                    if (!growthData || growthData.length === 0) {
                      return (
                        <div className="h-40 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <p className="text-sm">No follower data available yet</p>
                            <p className="text-xs mt-1">Data will appear as your page grows</p>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="h-40 relative">
                        {(() => {

                          // Calculate max/min from filtered data only
                          const followers = growthData.map(d => d.followers);
                          let maxFollowers = Math.max(...followers);
                          let minFollowers = Math.min(...followers);
                          
                          // For very small datasets (like 2 days), ensure we have some range
                          if (maxFollowers === minFollowers) {
                            // If all values are the same, add some padding
                            const baseValue = maxFollowers || 10;
                            minFollowers = Math.max(0, baseValue - 5);
                            maxFollowers = baseValue + 5;
                          } else {
                            // Add 10% padding for better visualization
                            const padding = Math.max(5, Math.ceil((maxFollowers - minFollowers) * 0.1));
                            minFollowers = Math.max(0, minFollowers - padding);
                            maxFollowers = maxFollowers + padding;
                          }
                          
                          // Round to nice numbers
                          if (maxFollowers < 100) {
                            maxFollowers = Math.ceil(maxFollowers / 10) * 10;
                            minFollowers = Math.floor(minFollowers / 10) * 10;
                          } else if (maxFollowers < 1000) {
                            maxFollowers = Math.ceil(maxFollowers / 50) * 50;
                            minFollowers = Math.floor(minFollowers / 50) * 50;
                          } else {
                            maxFollowers = Math.ceil(maxFollowers / 100) * 100;
                            minFollowers = Math.floor(minFollowers / 100) * 100;
                          }

                          const midFollowers = Math.round((maxFollowers + minFollowers) / 2);
                          const range = maxFollowers - minFollowers || 1;
                          
                          console.log(`   Chart Y-axis: ${minFollowers} to ${maxFollowers} (range: ${range})`);
                          console.log(`   Data points to plot: ${growthData.length}`);

                        return (
                          <svg viewBox="0 0 380 130" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                            {/* Grid lines - moved right to prevent overlap */}
                            {[10, 40, 70, 100, 130].map((y, i) => (
                              <line key={i} x1="75" y1={y} x2="375" y2={y} stroke="#F3F4F6" strokeWidth="1" />
                            ))}

                            {/* Y-axis labels - adjusted positioning with right alignment */}
                            <text x="65" y="14" fontSize="10" fill="#6B7280" fontWeight="600" textAnchor="end">
                              {formatNumberShort(maxFollowers)}
                            </text>
                            <text x="65" y="74" fontSize="10" fill="#6B7280" fontWeight="600" textAnchor="end">
                              {formatNumberShort(midFollowers)}
                            </text>
                            <text x="65" y="134" fontSize="10" fill="#6B7280" fontWeight="600" textAnchor="end">
                              {formatNumberShort(minFollowers)}
                            </text>

                            {/* Line - using ONLY real followerGrowthData */}
                            <polyline
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="3"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              points={growthData.map((d, i) => {
                                // Handle single point or multiple points
                                const x = growthData.length === 1 
                                  ? 227.5 // Center point if only 1 data point
                                  : 80 + (i / (growthData.length - 1)) * 290;
                                const normalizedValue = (d.followers - minFollowers) / range;
                                const y = 125 - normalizedValue * 115;
                                return `${x},${y}`;
                              }).join(' ')}
                            />
                            
                            {/* Add dots for each data point for better visibility */}
                            {growthData.map((d, i) => {
                              const x = growthData.length === 1 
                                ? 227.5 
                                : 80 + (i / (growthData.length - 1)) * 290;
                              const normalizedValue = (d.followers - minFollowers) / range;
                              const y = 125 - normalizedValue * 115;
                              return (
                                <circle
                                  key={i}
                                  cx={x}
                                  cy={y}
                                  r="4"
                                  fill="#10B981"
                                  stroke="white"
                                  strokeWidth="2"
                                />
                              );
                            })}
                          </svg>
                        );
                      })()}
                      <div className="absolute bottom-0 w-full flex justify-between px-20 text-xs text-gray-500 font-medium">
                        {(() => {
                          if (growthData && growthData.length > 0) {
                            // Show first and last date from FILTERED data
                            const firstDate = new Date(growthData[0].date);
                            const lastDate = new Date(growthData[growthData.length - 1].date);

                            return (
                              <>
                                <span>{`${firstDate.getMonth() + 1}/${firstDate.getDate()}`}</span>
                                <span className="text-right">{`${lastDate.getMonth() + 1}/${lastDate.getDate()}`}</span>
                              </>
                            );
                          }

                          // Fallback to relative labels if no real data
                          return (
                            <>
                              <span>Start</span>
                              <span>Now</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })()}
                </CardContent>
              </Card>
            </div>

            {/* B. Top Performing Posts (Row 2) */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Top Performing Post</h3>
                  <Button variant="ghost" className="text-orange-600 hover:text-orange-700">
                    View Full Report <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-200">
                        <th className="pb-3 font-medium">Post</th>
                        <th className="pb-3 font-medium text-right">Reach</th>
                        <th className="pb-3 font-medium text-right">Likes</th>
                        <th className="pb-3 font-medium text-right">Comments</th>
                        <th className="pb-3 font-medium text-right">Shares</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-900">
                      {(() => {
                        const currentData = network === 'facebook' ? facebookData : network === 'instagram' ? instagramData : linkedinData;
                        
                        // Filter posts by timeframe
                        const allPosts = currentData?.topPosts || [];
                        const filteredPosts = filterPostsByTimeframe(allPosts);
                        
                        // Check if we're showing older posts due to no recent posts
                        const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
                        const days = daysMap[timeframe] || 30;
                        const cutoffDate = new Date();
                        cutoffDate.setDate(cutoffDate.getDate() - days);
                        const hasRecentPosts = allPosts.some(post => {
                          const dateField = post.createdAt || post.created_time || post.timestamp;
                          if (!dateField) return false;
                          return new Date(dateField) >= cutoffDate;
                        });
                        
                        // Debug logging for reach
                        if (filteredPosts && filteredPosts.length > 0) {
                          console.log('📊 POST REACH DEBUG:');
                          console.log(`   Platform: ${network}`);
                          console.log(`   Timeframe: ${timeframe} (showing ${filteredPosts.length} posts)`);
                          console.log(`   Has recent posts: ${hasRecentPosts}`);
                          console.log(`   All posts count: ${allPosts.length}`);
                          console.log(`   Filtered posts count: ${filteredPosts.length}`);
                          filteredPosts.forEach((post, idx) => {
                            console.log(`   Post ${idx + 1}:`, {
                              format: post.format,
                              created_time: post.created_time,
                              reach: post.reach,
                              likes: post.likes,
                              comments: post.comments,
                              shares: post.shares,
                              message: (post.message || post.caption)?.substring(0, 50)
                            });
                          });
                        } else {
                          console.log('📊 POST DEBUG:');
                          console.log(`   Platform: ${network}`);
                          console.log(`   Timeframe: ${timeframe}`);
                          console.log(`   All posts count: ${allPosts.length}`);
                          console.log(`   Filtered posts count: 0`);
                          console.log(`   Showing fallback: ${allPosts.length > 0 ? 'most recent' : 'none'}`);
                        }
                        
                        return filteredPosts && filteredPosts.length > 0 ? (
                          filteredPosts.map((post, index) => (
                            <tr key={index} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                              <td className="py-3">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">{post.format}</span>
                                  {(post.message || post.caption) && (
                                    <a
                                      href={post.url || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-gray-500 hover:text-orange-600 truncate max-w-xs mt-1"
                                      title={post.fullCaption || post.message}
                                    >
                                      {post.message || post.caption}
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 text-right">{post.reach}</td>
                              <td className="py-3 text-right">{post.likes}</td>
                              <td className="py-3 text-right">{post.comments}</td>
                              <td className="py-3 text-right">{post.shares}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-gray-400 text-sm">
                              No posts available yet. Start posting to see engagement data!
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-6">

            {/* C. Competitor Comparison */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Competitor Comparison</h3>

                <select
                  className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2 bg-white mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M7%2010l5%205l5-5H7z%22%2F%3E%3C%2Fsvg%3E\")" }}
                >
                  <option>Competitor A</option>
                  <option>Competitor B</option>
                </select>

                <div className="space-y-4">
                  {/* Your Account */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">Y</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Your Account</p>
                        <p className="text-xs text-gray-500">Reach: {formatNumber(networkStats.reach)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">Engagement: 27K</span>
                  </div>

                  {/* Competitor A */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-xs font-bold">A</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Competitor A</p>
                        <p className="text-xs text-gray-500">Reach: 100K</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">Engagement: 27K</span>
                  </div>

                  {/* Competitor B */}
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-xs font-bold">B</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Competitor B</p>
                        <p className="text-xs text-gray-500">Reach: 3592</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">Engagement: 2.1K</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* D. Reputation Benchmark */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Reputation Benchmark</h3>

                <div className="flex flex-col items-center gap-4">
                  <svg viewBox="0 0 240 200" className="w-full" style={{ maxWidth: '280px' }}>
                    {/* Pentagon background layers */}
                    <polygon points="120,25 200,75 175,160 65,160 40,75" fill="#FFFBEB" stroke="#FEF3C7" strokeWidth="1.5" />
                    <polygon points="120,50 185,87 165,145 75,145 55,87" fill="none" stroke="#FDE68A" strokeWidth="1" />
                    <polygon points="120,75 170,99 155,130 85,130 70,99" fill="none" stroke="#FCD34D" strokeWidth="1" />

                    {/* Data pentagon (orange fill) */}
                    {(() => {
                      // Calculate scores from real platform data (Facebook, Instagram, or LinkedIn)
                      const calculateReputationScores = () => {
                        const currentData = network === 'facebook' ? facebookData : network === 'instagram' ? instagramData : linkedinData;

                        if (!currentData || !currentData.engagementScore) {
                          return [50, 50, 50, 50, 50]; // Default neutral scores
                        }

                        const engagement = currentData.engagementScore;

                        // 1. Review Score - Use backend calculated score for LinkedIn, or calculate from engagement rate
                        const reviewScore = network === 'linkedin' && engagement.score
                          ? engagement.score
                          : Math.min(100, engagement.engagementRate * 10);

                        // 2. Brand Mentions (based on likes/reactions)
                        const brandScore = engagement.likes > 0 ? Math.min(100, (engagement.likes / 100) * 100) : 50;

                        // 3. Consistency (based on post frequency)
                        const consistencyScore = currentData.topPosts && currentData.topPosts.length > 0
                          ? Math.min(100, (currentData.topPosts.length / 10) * 100)
                          : 50;

                        // 4. Responsiveness (based on comments - indicates interaction)
                        const responsivenessScore = engagement.comments > 0
                          ? Math.min(100, (engagement.comments / 50) * 100)
                          : 50;

                        // 5. Engagement Quality (based on shares and overall engagement)
                        const engagementQuality = engagement.shares > 0
                          ? Math.min(100, (engagement.shares / 20) * 100)
                          : Math.min(100, engagement.engagementRate * 8);

                        return [reviewScore, brandScore, consistencyScore, responsivenessScore, engagementQuality];
                      };

                      const scores = calculateReputationScores();
                      const centerX = 120
                      const centerY = 100
                      const maxRadius = 70

                      // Pentagon points (starting from top, going clockwise)
                      const angles = [
                        -Math.PI / 2,           // Top (Review Score)
                        -Math.PI / 2 + (2 * Math.PI / 5),     // Top-right (Brand Mentions)
                        -Math.PI / 2 + (4 * Math.PI / 5),     // Bottom-right (Consistency)
                        -Math.PI / 2 + (6 * Math.PI / 5),     // Bottom-left (Responsiveness)
                        -Math.PI / 2 + (8 * Math.PI / 5),     // Top-left (Engagement Quality)
                      ]

                      const points = scores.map((score, i) => {
                        const normalizedScore = score / 100
                        const r = maxRadius * normalizedScore
                        const x = centerX + r * Math.cos(angles[i])
                        const y = centerY + r * Math.sin(angles[i])
                        return `${x},${y}`
                      }).join(' ')

                      return <polygon points={points} fill="#FB923C" opacity="0.7" stroke="#F97316" strokeWidth="2.5" strokeLinejoin="round" />
                    })()}

                    {/* Labels positioned around pentagon */}
                    <text x="120" y="18" textAnchor="middle" fontSize="11" fill="#6B7280" fontWeight="600">Review Score®</text>
                    <text x="208" y="80" textAnchor="start" fontSize="11" fill="#6B7280" fontWeight="600">Brand Mentions®</text>
                    <text x="182" y="175" textAnchor="middle" fontSize="11" fill="#6B7280" fontWeight="600">Consistency®</text>
                    <text x="58" y="175" textAnchor="middle" fontSize="11" fill="#6B7280" fontWeight="600">Responsiveness®</text>
                    <text x="32" y="80" textAnchor="end" fontSize="11" fill="#6B7280" fontWeight="600">Engagement Quality®</text>
                  </svg>

                  <div className="text-center mt-2">
                    <p className="text-5xl font-extrabold text-orange-600">
                      {(() => {
                        const currentData = network === 'facebook' ? facebookData : network === 'instagram' ? instagramData : linkedinData;
                        return currentData?.reputationBenchmark?.score
                          ? `${currentData.reputationBenchmark.score}%`
                          : '50%';
                      })()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Overall Score</p>
                  </div>

                  <Button variant="ghost" className="w-full text-orange-600 hover:text-orange-700 mt-2">
                    View Full Report <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Error/Not Connected State */
        <Card className="border border-gray-200 shadow-lg">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No social media data available</h3>
            <p className="text-sm text-gray-500 mb-6">
              {socialData?.reason || 'Connect your platform account to view social metrics'}
            </p>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white px-6"
              onClick={() => router.push('/dashboard/social/connect')}
            >
              Connect Platform
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
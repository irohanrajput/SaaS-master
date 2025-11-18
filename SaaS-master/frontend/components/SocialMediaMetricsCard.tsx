'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  AlertCircle, 
  Loader2, 
  Download,
  ArrowRight,
  Menu,
  Bell,
  UserCircle,
  BarChart2,
  TrendingUp,
  Target,
  Users,
  MessageSquare,
  Zap,
  Star,
  ChevronDown
} from 'lucide-react'

// --- Interface Definitions (Kept from your original code) ---
interface SocialMediaMetricsCardProps {
  userEmail?: string
}

interface SocialSource {
  source: string
  users: number
  sessions: number
  pageViews: number
  conversions: number
  bounceRate: number
}

interface EngagementScore {
  likes: number
  comments: number
  saves: number
  shares: number
  engagementRate: number
  reach: number
  impressions: number
  profileViews: number
}

interface TopPost {
  format: string
  reach: string
  likes: string
  comments: string
  saves?: string
  shares: string
  caption?: string
  url?: string
  fullCaption?: string
}

interface SocialData {
  dataAvailable: boolean
  totalSocialSessions?: number
  totalSocialUsers?: number
  totalSocialConversions?: number
  socialConversionRate?: number
  socialTrafficPercentage?: number
  topSocialSources?: SocialSource[]
  reason?: string
  lastUpdated?: string
  // Instagram specific fields
  username?: string
  accountId?: string
  name?: string
  // Core metrics
  followers?: number
  engagementRate?: number
  reach?: number
  impressions?: number
  posts?: number
  engagementScore?: EngagementScore
  followerGrowth?: any[]
  topPosts?: TopPost[]
  reputationBenchmark?: {
    score: number
    followers: number
    avgEngagementRate: number
    sentiment: string
  }
}
// -----------------------------------------------------------

// --- Helper Components for the Design ---

// Reusable Navigation Link Component
const NavLink = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
    <Icon className="w-5 h-5 mr-3" />
    <span className="text-sm">{label}</span>
  </div>
)

// Top Performing Post Mock Data (fallback)
const topPostsMockFallback = [
    { format: 'Single Image', reach: '27.2K', likes: '3K', comments: '1K', shares: '2.7K', caption: 'Sample post 1', fullCaption: 'This is a sample post with full caption 1', url: '#' },
    { format: 'Video', reach: '25.3K', likes: '2.4K', comments: '1K', shares: '1K', caption: 'Sample post 2', fullCaption: 'This is a sample post with full caption 2', url: '#' },
    { format: 'Carousel', reach: '15.1K', likes: '2K', comments: '1K', shares: '1.1K', caption: 'Sample post 3', fullCaption: 'This is a sample post with full caption 3', url: '#' },
    { format: 'Link Post', reach: '7.2K', likes: '0.8K', comments: '0.4K', shares: '0.3K', caption: 'Sample post 4', fullCaption: 'This is a sample post with full caption 4', url: '#' },
];

// --- Main Component ---

export default function SocialMediaMetricsPage({ userEmail: propUserEmail }: SocialMediaMetricsCardProps) {
  const [socialData, setSocialData] = useState<SocialData | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [connected, setConnected] = useState(false)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [network, setNetwork] = useState<'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'all'>('instagram')
  const [userEmail, setUserEmail] = useState<string>(propUserEmail || '')
  
  // State for client-side random data to prevent Hydration Error
  const [followerGrowthData, setFollowerGrowthData] = useState<any[]>([]);

  // --- Functions (Modified for client-side data simulation) ---

  const fetchSocialMetrics = async () => {
    setLoadingData(true)
    try {
      // Get API URL from environment variable or use default
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
      
      // Determine which API to call based on network selection
      let apiUrl = ''
      const periodMap = { '7d': 'week', '30d': 'month', '90d': 'month' }
      const period = periodMap[timeframe]

      if (network === 'instagram') {
        apiUrl = `${API_URL}/api/instagram/metrics?email=${encodeURIComponent(userEmail)}&period=${period}`
      } else if (network === 'facebook') {
        apiUrl = `${API_URL}/api/facebook/metrics?email=${encodeURIComponent(userEmail)}&period=${period}`
      } else {
        // Default to Instagram for now
        apiUrl = `${API_URL}/api/instagram/metrics?email=${encodeURIComponent(userEmail)}&period=${period}`
      }

      console.log('📡 Fetching social media data from:', apiUrl)
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Social media data received:', data)

      // Process the API response data
      if (data.success && data.data) {
        const apiData = data.data
        
        // Transform API data to match expected format
        const formattedData: SocialData = {
          dataAvailable: true,
          followers: apiData.followers || 0,
          engagementRate: apiData.engagement || 0,
          reach: apiData.reach || 0,
          impressions: apiData.impressions || 0,
          posts: apiData.posts || 0,
          engagementScore: {
            likes: apiData.likes || 0,
            comments: apiData.comments || 0,
            shares: apiData.shares || 0,
            engagementRate: apiData.engagement || 0,
            saves: 0,
            reach: apiData.reach || 0,
            impressions: apiData.impressions || 0,
            profileViews: 0
          },
          followerGrowth: [],
          topPosts: topPostsMockFallback // Keep mock posts for now
        }
        
        console.log('📊 Formatted data:', formattedData)
        setSocialData(formattedData)
        setConnected(true)
      } else {
        throw new Error('Invalid API response structure')
      }
    } catch (error) {
      console.error('Error fetching social media data:', error)
      setSocialData({
        dataAvailable: false,
        reason: 'Failed to fetch data. Please ensure your account is connected.'
      })
      setConnected(false)
    } finally {
      setLoadingData(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return Math.round(num).toString()
  }

  const computeEngagementScore = useMemo(() => {
    if (!socialData?.dataAvailable || !socialData?.engagementScore) return 82
    
    // Calculate engagement score based on engagement rate
    const engagementRate = socialData.engagementScore.engagementRate || 0
    
    // Convert engagement rate to a score out of 100
    // Typical good engagement rates are 1-5%, excellent is 5%+
    // We'll scale it so 5% = 100 score
    const score = Math.min(100, Math.max(20, engagementRate * 20))
    
    return Math.round(score)
  }, [socialData])


  const getNetworkStats = useMemo(() => {
    // Use real data from API if available
    if (socialData?.dataAvailable && socialData?.engagementScore) {
      const engagement = socialData.engagementScore
      
      console.log('🔢 Calculating network stats from:', engagement)
      
      // Format numbers with K suffix included
      const formatNumber = (num: number) => {
        if (num >= 1000) {
          return (num / 1000).toFixed(1) + 'K'
        }
        return num.toString()
      }
      
      const stats = {
        likes: formatNumber(engagement.likes),
        comments: formatNumber(engagement.comments),
        shares: formatNumber(engagement.shares || 0),
        engagementRate: engagement.engagementRate.toFixed(1),
        reach: engagement.reach
      }
      
      console.log('📊 Formatted stats:', stats)
      
      return stats
    }
    
    // Fallback to mock data if no real data available
    const engagementScore = computeEngagementScore
    const baseReach = socialData?.totalSocialUsers || 77780
    
    const stats = {
      linkedin: { likes: '8.2', comments: '3.4', shares: '7.1', engagementRate: '25', reach: 77780 },
      facebook: { likes: '12.5', comments: '5.2', shares: '4.3', engagementRate: '18', reach: baseReach * 1.5 },
      instagram: { likes: '15.8', comments: '6.8', shares: '2.9', engagementRate: '22', reach: baseReach * 2 },
      twitter: { likes: '6.3', comments: '2.1', shares: '8.5', engagementRate: '16', reach: baseReach * 0.8 },
      all: { likes: '10.7', comments: '4.4', shares: '5.7', engagementRate: (engagementScore/3).toFixed(1), reach: baseReach * 1.2 }
    }
    
    return stats[network]
  }, [network, socialData, computeEngagementScore])
  
  const networkStats = getNetworkStats

  // Function to calculate follower growth data (uses real data if available)
  const calculateFollowerGrowthData = (currentNetwork: 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'all') => {
      // Use real data from API if available
      if (socialData?.dataAvailable && socialData?.followerGrowth && socialData.followerGrowth.length > 0) {
          return socialData.followerGrowth.map((item, index) => ({
              value: item.followers,
              label: index,
              date: item.date
          }));
      }
      
      // Fallback to mock data
      const baseMultiplier = {
          linkedin: 1.0, facebook: 1.5, instagram: 2.0, twitter: 0.8, all: 1.2
      }[currentNetwork];
      
      const base = 200 // Use a constant base to match the chart scale
      const data = [];
      let currentValue = 100; // Start around 100
      
      for (let i = 0; i < 12; i++) {
          // Math.random() is run only on the client
          const change = (Math.random() * 50 - 20) * baseMultiplier; // Simulates fluctuating growth
          currentValue = Math.max(currentValue + change, 50);
          data.push({
              value: Math.round(currentValue),
              label: i
          });
      }
      return data;
  };
  
  // useEffect to get user email on mount
  useEffect(() => {
    const getUserEmail = async () => {
      if (!propUserEmail) {
        try {
          // Dynamically import to avoid SSR issues
          const { createClient } = await import('@/utils/supabase/client')
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (user?.email) {
            setUserEmail(user.email)
          }
        } catch (error) {
          console.error('Error fetching user email:', error)
        }
      }
    }
    getUserEmail()
  }, [propUserEmail])

  // useEffect to fetch API data
  useEffect(() => {
    if (userEmail) {
      fetchSocialMetrics()
    }
  }, [userEmail, timeframe, network])

  // useEffect to run random/mock data calculation on client only
  useEffect(() => {
    // This runs only on the client side after hydration
    setFollowerGrowthData(calculateFollowerGrowthData(network));
  }, [network, socialData]); // Recalculate if network changes


  // --- JSX Rendering ---

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* 1. Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-10">
            <img src="/claryx-logo.png" alt="CLARYX" className="h-6 w-auto" /> 
            <span className="text-xl font-bold text-orange-600 ml-2">CLARYX</span>
          </div>

          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">MENU</h3>
          <div className="space-y-1">
            <NavLink icon={BarChart2} label="Dashboard" />
            <NavLink icon={TrendingUp} label="SEO & Website Performance" />
            <NavLink icon={Star} label="Social Media Performance" active={true} />
            <NavLink icon={Target} label="Competitor Intelligence" />
            <NavLink icon={Users} label="Lead Funnel Diagnostics" />
            <NavLink icon={MessageSquare} label="AI Insights Hub" />
            <NavLink icon={Zap} label="Reports & Alerts" />
          </div>

          <h3 className="text-xs font-semibold uppercase text-gray-400 mt-6 mb-2">OTHER</h3>
          <div className="space-y-1">
            <NavLink icon={MessageSquare} label="Chatbot" />
            <NavLink icon={UserCircle} label="Hire Us" />
          </div>
        </div>

        {/* Plan Upgrade Card */}
        <div className="bg-orange-50 p-4 rounded-xl text-center">
          <p className="text-xs text-orange-800 mb-2">
            **Current plan:** **Free Plan**
          </p>
          <p className="text-sm font-semibold text-orange-900 mb-3">
            Upgrade to **Premium Plan**
          </p>
          <p className="text-xs text-orange-800 mb-4">
            Unlock all our premium features and unlimited reports.
          </p>
          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm">
            Upgrade Now
          </Button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Top Header/Navbar */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center">
            <Menu className="w-6 h-6 text-gray-500 mr-4 cursor-pointer lg:hidden" />
            <h1 className="text-xl font-bold text-gray-900">Social Media Performance</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="h-9">
                <Download className="w-4 h-4 mr-2" /> Download
            </Button>
            <Bell className="w-6 h-6 text-gray-500 cursor-pointer hover:text-orange-600" />
            <div className="flex items-center cursor-pointer">
              <UserCircle className="w-8 h-8 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">Your Name</span>
              <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="p-8 space-y-6">
          
          {/* Filters Row */}
          <div className="flex items-center gap-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center]"
              style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M7%2010l5%205l5-5H7z%22%2F%3E%3C%2Fsvg%3E\")" }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center]"
              style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M7%2010l5%205l5-5H7z%22%2F%3E%3C%2Fsvg%3E\")" }}
            >
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter/X</option>
              <option value="all">All Platforms</option>
            </select>
          </div>
          
          {loadingData ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-xl shadow-lg">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              <span className="ml-3 text-gray-600">Loading social metrics...</span>
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
                          const score = computeEngagementScore
                          const radius = 50
                          const circumference = 2 * Math.PI * radius
                          const progress = (score / 100) * circumference
                          return (
                            <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
                              <circle cx="60" cy="60" r={radius} fill="none" stroke="#FEE2E2" strokeWidth="10" />
                              <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="none"
                                stroke="#10B981" // Green color to match design
                                strokeWidth="10"
                                strokeDasharray={`${progress} ${circumference - progress}`}
                                strokeLinecap="round"
                              />
                              <text x="60" y="60" textAnchor="middle" className="fill-gray-900 rotate-90" fontSize="26" fontWeight="700" transform="rotate(90 60 60)">{score}%</text>
                              <text x="60" y="78" textAnchor="middle" className="fill-gray-500 rotate-90" fontSize="10" transform="rotate(90 60 60)">Above Avg</text>
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
                        <div className="flex justify-between items-center pt-2 text-gray-500 border-t border-gray-100">
                            <span className="text-xs">Engagement Rate</span>
                            <span className="text-sm font-semibold text-gray-900">{networkStats.engagementRate}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Follower Growth Card (Chart) */}
                  <Card className="border-none shadow-lg">
                    <CardHeader className="p-6 pb-0">
                      <CardTitle className="text-lg font-bold text-gray-900">Follower Growth</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-4">
                      {followerGrowthData.length > 0 ? (
                        <div className="h-40 relative">
                          <svg viewBox="0 0 300 120" className="w-full h-full">
                            {/* Grid lines (simplified) */}
                            {[0, 30, 60, 90, 120].map((y, i) => (
                              <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#F3F4F6" strokeWidth="1" />
                            ))}
                            
                            {/* Y-axis labels */}
                            <text x="5" y="15" fontSize="8" fill="#9CA3AF" textAnchor="start">300</text>
                            <text x="5" y="70" fontSize="8" fill="#9CA3AF" textAnchor="start">150</text>

                            {/* Line */}
                            <polyline
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="2"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              points={followerGrowthData.map((d, i) => {
                                // Scale to 300 width and 120 height (inverted y)
                                const x = 20 + (i / (followerGrowthData.length - 1)) * 280
                                const y = 120 - (d.value / 350) * 120 // 350 max value for scaling
                                return `${x},${y}`
                              }).join(' ')}
                            />
                            
                            {/* Data points (optional, not strictly necessary for look) */}
                          </svg>
                          <div className="absolute bottom-0 w-full flex justify-between px-5 text-xs text-gray-400">
                              <span>1/25</span>
                              <span>10/25</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-40 flex items-center justify-center text-gray-400">
                          Loading chart...
                        </div>
                      )}
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
                          {(socialData?.topPosts && socialData.topPosts.length > 0 
                            ? socialData.topPosts 
                            : topPostsMockFallback
                          ).map((post, index) => (
                            <tr key={index} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                              <td className="py-3">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">{post.format}</span>
                                  {post.caption && (
                                    <a 
                                      href={post.url || '#'} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-gray-500 hover:text-orange-600 truncate max-w-xs mt-1"
                                      title={post.fullCaption || post.caption}
                                    >
                                      {post.caption}
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 text-right">{post.reach}</td>
                              <td className="py-3 text-right">{post.likes}</td>
                              <td className="py-3 text-right">{post.comments}</td>
                              <td className="py-3 text-right">{post.shares}</td>
                            </tr>
                          ))}
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
                            <p className="text-xs text-gray-500">Reach: **{formatNumber(networkStats.reach)}**</p>
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
                      
                      {/* Competitor B (Mock data for different view) */}
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
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 text-left">Reputation Benchmark</h3>
                    
                    <div className="flex flex-col items-center gap-6">
                      <svg viewBox="0 0 200 180" className="w-full max-w-xs">
                        {/* Pentagon background (Base - Lighter orange/yellow) */}
                        <polygon points="100,20 180,70 150,150 50,150 20,70" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
                        <polygon points="100,20 180,70 150,150 50,150 20,70" fill="none" stroke="#FDE68A" strokeWidth="1" />
                        <polygon points="100,56 164,88 140,132 60,132 36,88" fill="none" stroke="#FDE68A" strokeWidth="1" />
                        <polygon points="100,92 148,106 130,126 70,126 52,106" fill="none" stroke="#FDE68A" strokeWidth="1" />
                        
                        {/* Data pentagon (Radar chart - Orange/Red fill) */}
                        {(() => {
                          // Mock Scores out of 100 for each axis
                          const scores = [85, 90, 70, 75, 80] // Engagement, Brand, Consistency, Responsiveness, Review
                          const maxRadius = 80 // Distance from center to tip (20 to 100)
                          const center = [100, 95] // Adjusted center for better fit

                          const angleToPoint = (angle: number, score: number) => {
                              const radius = center[0] - 20
                              const r = (score / 100) * radius * 0.9 + (center[0] - radius - 5);
                              const x = center[0] + r * Math.cos(angle);
                              const y = center[1] + r * Math.sin(angle);
                              return `${x},${y}`;
                          }

                          const angles = [
                              Math.PI * 1.5, // Review Score (Top)
                              Math.PI * 1.75, // Brand Mentions
                              Math.PI * 0.05, // Consistency (Bottom Right)
                              Math.PI * 0.45, // Responsiveness (Bottom Left)
                              Math.PI * 1.25, // Engagement Quality
                          ]
                          
                          // Convert scores to polygon points
                          const points = scores.map((score, i) => {
                              // Simple scaling logic to match the visual feel
                              const r_factor = (score - 50) / 50 * 0.8 + 0.2 // Scale score (50-100 -> 0.2-1.0)
                              const r = maxRadius * r_factor
                              const angle = angles[i]

                              // Adjust point from origin [100, 95] (center)
                              const x = 100 + r * Math.cos(angle - Math.PI/2) // Offset angle by -90 deg
                              const y = 95 + r * Math.sin(angle - Math.PI/2)

                              return `${x},${y}`
                          }).join(' ')

                          return <polygon points={points} fill="#F97316" opacity="0.6" stroke="#F97316" strokeWidth="2" />
                        })()}
                        
                        {/* Labels */}
                        <text x="100" y="15" textAnchor="middle" fontSize="10" fill="#6B7280" className="font-semibold">Review Score®</text>
                        <text x="188" y="70" textAnchor="end" fontSize="10" fill="#6B7280" className="font-semibold">Brand Mentions®</text>
                        <text x="155" y="165" textAnchor="middle" fontSize="10" fill="#6B7280" className="font-semibold">Consistency®</text>
                        <text x="45" y="165" textAnchor="middle" fontSize="10" fill="#6B7280" className="font-semibold">Responsiveness®</text>
                        <text x="12" y="70" textAnchor="start" fontSize="10" fill="#6B7280" className="font-semibold">Engagement Quality®</text>
                        
                      </svg>
                      
                      <div className="text-center">
                        <p className="text-5xl font-extrabold text-orange-600">
                          {socialData?.reputationBenchmark?.score || 77}%
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {socialData?.reputationBenchmark?.sentiment || 'Overall Score'}
                        </p>
                      </div>
                      
                      <Button variant="ghost" className="w-full text-orange-600 hover:text-orange-700">
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
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6">
                  Connect Platform
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
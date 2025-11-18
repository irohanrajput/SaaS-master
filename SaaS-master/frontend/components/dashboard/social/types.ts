// Shared types for Social Media Dashboard

export interface TopPost {
  format: string
  reach: string | number
  likes: string | number
  comments: string | number
  shares: string | number
  message?: string
  caption?: string
  url?: string
  date?: string
  created_time?: string
  createdAt?: string
  timestamp?: string
}

export interface FollowerGrowthData {
  date: string
  followers: number
  gained: number
  lost: number
  net: number
}

export interface EngagementScore {
  likes: number
  comments: number
  shares: number
  clicks?: number
  saves?: number
  engagementRate: number
  score?: number
  reach: number
  impressions?: number
  profileViews?: number
}

export interface ReputationBenchmark {
  score: number
  followers: number
  avgEngagementRate: number
  sentiment: string
  avgEngagementPerPost?: number
}

export interface BasePlatformMetrics {
  dataAvailable: boolean
  engagementScore?: EngagementScore
  followerGrowth?: FollowerGrowthData[]
  topPosts?: TopPost[]
  reputationBenchmark?: ReputationBenchmark
  reason?: string
  lastUpdated?: string
}

export interface FacebookMetrics extends BasePlatformMetrics {
  pageName?: string
  pageId?: string
}

export interface LinkedInMetrics extends BasePlatformMetrics {
  companyName?: string
  companyUrl?: string
  companyFollowers?: number
  source?: string
  scrapedPostsCount?: number
  allPosts?: TopPost[]
}

export interface InstagramMetrics extends BasePlatformMetrics {
  username?: string
  accountId?: string
  name?: string
}

export type PlatformType = 'facebook' | 'linkedin' | 'instagram'
export type TimeframeType = '7d' | '30d' | '90d' | 'all'

export interface DashboardState {
  network: PlatformType
  timeframe: TimeframeType
  loading: boolean
  checkingConnection: boolean
  data: {
    facebook: FacebookMetrics | null
    linkedin: LinkedInMetrics | null
    instagram: InstagramMetrics | null
  }
  connections: {
    facebook: boolean
    linkedin: boolean
    instagram: boolean
  }
}

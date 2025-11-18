// Utility functions for Social Media Dashboard

import { TopPost, TimeframeType } from './types'

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

export const normalizePostDate = (post: TopPost): Date | null => {
  const dateField = post.date || post.created_time || post.createdAt || post.timestamp
  if (!dateField) return null
  return new Date(dateField)
}

export const filterPostsByTimeframe = (posts: TopPost[], timeframe: TimeframeType): TopPost[] => {
  if (!posts || posts.length === 0) return posts
  if (timeframe === 'all') return posts

  const daysMap: Record<TimeframeType, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    'all': 999999
  }
  
  const days = daysMap[timeframe]
  const now = new Date()
  const cutoffDate = new Date(now)
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return posts.filter(post => {
    const postDate = normalizePostDate(post)
    if (!postDate) return false
    return postDate >= cutoffDate
  })
}

export const filterGrowthDataByTimeframe = (data: any[], timeframe: TimeframeType): any[] => {
  if (!data || data.length === 0) return data
  if (timeframe === 'all') return data

  const daysMap: Record<TimeframeType, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    'all': 999999
  }
  
  const days = daysMap[timeframe]
  return data.slice(-days)
}

export const getCacheKey = (platform: string, email: string): string => {
  return `social_${platform}_${email}_v4`
}

export const getCachedData = (platform: string, email: string): any | null => {
  try {
    const cacheKey = getCacheKey(platform, email)
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    const parsedCache = JSON.parse(cached)
    const ageMinutes = (Date.now() - parsedCache.timestamp) / (1000 * 60)

    const CACHE_VERSION = 4
    if (!parsedCache.version || parsedCache.version < CACHE_VERSION) {
      localStorage.removeItem(cacheKey)
      return null
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

export const setCachedData = (platform: string, email: string, data: any): void => {
  try {
    const cacheKey = getCacheKey(platform, email)
    const CACHE_VERSION = 4
    const cacheData = {
      data: data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
      email: email // Store email to detect user changes
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    console.log(`💾 Cached ${platform} data (v${CACHE_VERSION})`)
  } catch (error) {
    console.error('Error saving cache:', error)
  }
}

export const clearCacheForUser = (email: string): void => {
  const platforms = ['facebook', 'linkedin', 'instagram']
  platforms.forEach(platform => {
    const cacheKey = getCacheKey(platform, email)
    localStorage.removeItem(cacheKey)
  })
  console.log('🗑️ Cleared all social media cache')
}

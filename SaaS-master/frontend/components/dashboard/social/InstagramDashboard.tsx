'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { InstagramMetrics, TimeframeType } from './types'
import { filterPostsByTimeframe, filterGrowthDataByTimeframe, formatNumber } from './utils'

interface InstagramDashboardProps {
  data: InstagramMetrics | null
  timeframe: TimeframeType
  loading: boolean
}

export default function InstagramDashboard({ data, timeframe, loading }: InstagramDashboardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
          <p className="mt-4 text-gray-600 font-medium">Loading Instagram metrics...</p>
        </div>
      </div>
    )
  }

  if (!data?.dataAvailable) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">{data?.reason || 'No Instagram data available'}</p>
        </CardContent>
      </Card>
    )
  }

  const filteredPosts = data.topPosts ? filterPostsByTimeframe(data.topPosts, timeframe) : []
  const filteredGrowth = data.followerGrowth ? filterGrowthDataByTimeframe(data.followerGrowth, timeframe) : []

  return (
    <div className="space-y-6">
      {/* Engagement Score */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-pink-600">
                {data.engagementScore?.engagementRate?.toFixed(1) || '0'}%
              </div>
              <p className="text-sm text-gray-500 mt-1">Engagement Rate</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-8">
                <span className="text-gray-600">Likes:</span>
                <span className="font-semibold">{formatNumber(data.engagementScore?.likes || 0)}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-gray-600">Comments:</span>
                <span className="font-semibold">{formatNumber(data.engagementScore?.comments || 0)}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-gray-600">Saves:</span>
                <span className="font-semibold">{formatNumber(data.engagementScore?.saves || 0)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
          <p className="text-sm text-gray-500">Showing {filteredPosts.length} posts for {timeframe}</p>
        </CardHeader>
        <CardContent>
          {filteredPosts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No posts available for this timeframe</p>
          ) : (
            <div className="space-y-4">
              {filteredPosts.slice(0, 5).map((post, idx) => (
                <div key={idx} className="border-b pb-4 last:border-0">
                  <p className="text-sm text-gray-700 line-clamp-2">{post.caption || post.message}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                    <span>🔖 {post.shares}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      {filteredGrowth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-semibold">@{data.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Followers</p>
                <p className="text-2xl font-bold">
                  {formatNumber(filteredGrowth[filteredGrowth.length - 1]?.followers || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

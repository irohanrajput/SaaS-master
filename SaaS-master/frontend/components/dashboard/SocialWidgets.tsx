"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, ShieldCheck, Star } from 'lucide-react'

export default function SocialWidgets() {
  return (
    <>
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Competitor Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-3">Reach & engagement vs competitors</div>
          <div className="space-y-3">
            {["Your Account","Competitor A","Competitor B"].map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{c}</div>
                    <div className="text-xs text-gray-500">Followers: {Math.floor(Math.random()*100000)}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-700">Engagement: {Math.floor(Math.random()*100)}%</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full border-orange-500 text-orange-600 hover:bg-orange-50">View Full Comparison</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Reputation Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-3">Overview across selected platforms</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-600"/> <div className="text-sm">Sentiment</div></div>
              <div className="font-medium">Positive</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500"/> <div className="text-sm">Average Rating</div></div>
              <div className="font-medium">4.2/5</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Availability & Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-3">Feature availability by plan</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm">Starter</div>
              <Badge>LinkedIn / Facebook</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Growth</div>
              <Badge>All Platforms</Badge>
            </div>
          </div>
          <div className="mt-4">
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Upgrade Plan</Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

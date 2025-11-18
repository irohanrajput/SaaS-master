'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Target, Plus, TrendingUp, Trash2, Globe } from 'lucide-react'
import { 
  Instagram as InstagramIcon, 
  Facebook as FacebookIcon,
  Linkedin as LinkedinIcon
} from 'lucide-react'

interface Competitor {
  id: string
  domain: string
  instagram: string
  facebook: string
  linkedin: string
}

interface CompetitorsCardProps {
  competitors: Competitor[]
  loading: boolean
  selectedCompetitorId?: string
  onAddClick: () => void
  onAnalyze: (competitor: Competitor) => void
  onRemove: (competitorId: string) => void
}

export default function CompetitorsCard({
  competitors,
  loading,
  selectedCompetitorId,
  onAddClick,
  onAnalyze,
  onRemove
}: CompetitorsCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Target className="w-4 h-4 text-gray-900" />
              Step 3: Your Competitors
            </CardTitle>
            <CardDescription className="text-sm">Add competitors to analyze and compare</CardDescription>
          </div>
          <Button 
            onClick={onAddClick}
            className="bg-orange-500 hover:bg-orange-600 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Competitor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {competitors.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">No competitors added yet</p>
            <Button onClick={onAddClick}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Competitor
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {competitors.map((competitor) => (
              <div 
                key={competitor.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{competitor.domain}</span>
                  </div>
                  {(competitor.instagram || competitor.facebook || competitor.linkedin) && (
                    <div className="flex gap-2 flex-wrap">
                      {competitor.instagram && (
                        <Badge variant="outline" className="text-xs">
                          <InstagramIcon className="w-3 h-3 mr-1" />
                          {competitor.instagram}
                        </Badge>
                      )}
                      {competitor.facebook && (
                        <Badge variant="outline" className="text-xs">
                          <FacebookIcon className="w-3 h-3 mr-1" />
                          {competitor.facebook}
                        </Badge>
                      )}
                      {competitor.linkedin && (
                        <Badge variant="outline" className="text-xs">
                          <LinkedinIcon className="w-3 h-3 mr-1" />
                          {competitor.linkedin}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onAnalyze(competitor)}
                    disabled={loading}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {loading && selectedCompetitorId === competitor.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Analyze
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => onRemove(competitor.id)}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

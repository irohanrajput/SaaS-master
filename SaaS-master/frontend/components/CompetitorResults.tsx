'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  TrendingUp, Target, Globe, Activity, Share2, Sparkles,
  Lightbulb, Loader2, AlertCircle, ArrowRight, Zap, Shield,
  CheckCircle2, Search, Instagram as InstagramIcon,
  Facebook as FacebookIcon, Trophy, FileText, Image, Link as LinkIcon,
  Code, Lock, BarChart3, Building2
} from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement)

interface CompetitorResultsProps {
  data: any
  analysisType: 'seo' | 'ads' | 'content' | 'social' | 'technical'
}

export default function CompetitorResults({ data, analysisType }: CompetitorResultsProps) {
  if (!data) {
    return null
  }

  const actualData = data.data || data

  if (!actualData.success && !actualData.yourSite) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Analysis Failed</CardTitle>
          <CardDescription className="text-red-600">
            {actualData.error || 'Unable to complete competitor analysis'}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const { yourSite, competitorSite, comparison } = actualData

  // Debug: Log FULL data structure
  console.log('🔍 CompetitorResults FULL DEBUG:', {
    yourSite: {
      contentChanges: yourSite?.contentChanges,
      instagram: yourSite?.instagram,
      facebook: yourSite?.facebook,
      linkedin: yourSite?.linkedin,
      puppeteer: yourSite?.puppeteer
    },
    competitorSite: {
      contentChanges: competitorSite?.contentChanges,
      instagram: competitorSite?.instagram,
      facebook: competitorSite?.facebook,
      linkedin: competitorSite?.linkedin,
      puppeteer: competitorSite?.puppeteer
    },
    comparison: {
      technology: comparison?.technology,
      security: comparison?.security
    }
  })

  // Puppeteer structure debug
  if (yourSite?.puppeteer) {
    console.log('🔧 YOUR PUPPETEER STRUCTURE:', JSON.stringify(yourSite.puppeteer, null, 2))
  }
  if (competitorSite?.puppeteer) {
    console.log('🔧 COMPETITOR PUPPETEER STRUCTURE:', JSON.stringify(competitorSite.puppeteer, null, 2))
  }

  // Instagram structure debug
  if (yourSite?.instagram) {
    console.log('📱 YOUR INSTAGRAM FULL STRUCTURE:', JSON.stringify(yourSite.instagram, null, 2))
  }
  if (competitorSite?.instagram) {
    console.log('📱 COMPETITOR INSTAGRAM FULL STRUCTURE:', JSON.stringify(competitorSite.instagram, null, 2))
  }

  // Facebook structure debug
  if (yourSite?.facebook) {
    console.log('📘 YOUR FACEBOOK FULL STRUCTURE:', JSON.stringify(yourSite.facebook, null, 2))
  }
  if (competitorSite?.facebook) {
    console.log('📘 COMPETITOR FACEBOOK FULL STRUCTURE:', JSON.stringify(competitorSite.facebook, null, 2))
  }

  // LinkedIn structure debug
  if (yourSite?.linkedin) {
    console.log('💼 YOUR LINKEDIN FULL STRUCTURE:', JSON.stringify(yourSite.linkedin, null, 2))
  }
  if (competitorSite?.linkedin) {
    console.log('💼 COMPETITOR LINKEDIN FULL STRUCTURE:', JSON.stringify(competitorSite.linkedin, null, 2))
  }

  if (!yourSite || !competitorSite || !comparison) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Incomplete Data</CardTitle>
          <CardDescription className="text-yellow-600">
            Required comparison data is missing
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Calculate what to show
  const showTrafficCard = !!(yourSite?.traffic || competitorSite?.traffic || comparison?.traffic)
  const showContentCard = !!(yourSite?.puppeteer?.content || competitorSite?.puppeteer?.content || comparison?.content)
  const showGoogleAdsCard = !!(competitorSite?.googleAds && competitorSite.googleAds.totalAds > 0)
  const showMetaAdsCard = !!(competitorSite?.metaAds && competitorSite.metaAds.totalAds > 0)
  const showInstagramCard = !!(yourSite?.instagram || competitorSite?.instagram)
  const showFacebookCard = !!(yourSite?.facebook || competitorSite?.facebook)
  const showSEOCard = !!(comparison?.seo)
  const showTechCard = !!(yourSite?.puppeteer?.technology || competitorSite?.puppeteer?.technology || comparison?.technology)
  const showSecurityCard = !!(yourSite?.puppeteer || competitorSite?.puppeteer || comparison?.security)
  const showContentChangesCard = !!(yourSite?.contentChanges?.success || competitorSite?.contentChanges?.success)
  const showBacklinksCard = !!(yourSite?.backlinks || competitorSite?.backlinks || comparison?.backlinks)

  // Generate mock traffic data for charts (replace with real data when available)
  const generateTrafficData = () => {
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    // Use actual monthly visits or 0 if not available
    const yourTrafficBase = typeof yourSite?.traffic?.metrics?.monthlyVisits === 'number' 
      ? yourSite.traffic.metrics.monthlyVisits 
      : 0
    const compTrafficBase = typeof competitorSite?.traffic?.metrics?.monthlyVisits === 'number'
      ? competitorSite.traffic.metrics.monthlyVisits
      : 0

    // If both are 0, use minimal sample data for visualization
    const yourBase = yourTrafficBase || 100
    const compBase = compTrafficBase || 800

    return {
      labels,
      datasets: [
        {
          label: `Your Traffic (${yourSite?.traffic?.source === 'google_analytics' ? 'Google Analytics' : 'SimilarWeb'})`,
          data: [
            Math.round(yourBase * 0.8),
            Math.round(yourBase * 0.9),
            Math.round(yourBase * 1.05),
            yourBase
          ],
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4
        },
        {
          label: `Competitor Traffic (SimilarWeb)`,
          data: [
            Math.round(compBase * 0.85),
            Math.round(compBase * 0.95),
            Math.round(compBase * 1.1),
            compBase
          ],
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }
      ]
    }
  }

  // Generate backlinks data for charts
  const generateBacklinksData = () => {
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    const yourBacklinksBase = yourSite?.backlinks?.totalBacklinks || 0
    const compBacklinksBase = competitorSite?.backlinks?.totalBacklinks || 0

    return {
      labels,
      datasets: [
        {
          label: `Your Backlinks`,
          data: [
            yourBacklinksBase * 0.85,
            yourBacklinksBase * 0.92,
            yourBacklinksBase * 1.05,
            yourBacklinksBase
          ],
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4
        },
        {
          label: `Competitor Backlinks`,
          data: [
            compBacklinksBase * 0.88,
            compBacklinksBase * 0.95,
            compBacklinksBase * 1.08,
            compBacklinksBase
          ],
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }
      ]
    }
  }

  const trafficChartData = generateTrafficData()
  const backlinksChartData = generateBacklinksData()
  const trafficChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} visits`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return value.toLocaleString()
          }
        }
      }
    }
  }

  const backlinksChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} backlinks`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return value.toLocaleString()
          }
        }
      }
    }
  }

  // Chart data
  const performanceChartData = {
    labels: ['Performance', 'Accessibility', 'Best Practices', 'SEO'],
    datasets: [
      {
        label: yourSite?.domain || 'Your Site',
        data: [
          yourSite?.lighthouse?.categories?.performance?.displayValue || 0,
          yourSite?.lighthouse?.categories?.accessibility?.displayValue || 0,
          yourSite?.lighthouse?.categories?.['best-practices']?.displayValue || 0,
          yourSite?.lighthouse?.categories?.seo?.displayValue || 0
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2
      },
      {
        label: competitorSite?.domain || 'Competitor',
        data: [
          competitorSite?.lighthouse?.categories?.performance?.displayValue || 0,
          competitorSite?.lighthouse?.categories?.accessibility?.displayValue || 0,
          competitorSite?.lighthouse?.categories?.['best-practices']?.displayValue || 0,
          competitorSite?.lighthouse?.categories?.seo?.displayValue || 0
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }
    ]
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  }

  const yourMarketShare = yourSite?.lighthouse?.categories?.seo?.score || 61
  const competitorMarketShare = competitorSite?.lighthouse?.categories?.seo?.score || 29

  return (
    <div className="w-full space-y-3 lg:space-y-4 animate-in fade-in duration-500">

      {/* SEO Analysis View */}
      {analysisType === 'seo' && 
        <>
          {/* Top Row: Traffic Chart and SEO Metrics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4">

            {/* Website Traffic Chart */}
            {showTrafficCard && (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Website Traffic (Organic)
                    <sup className="text-xs text-muted-foreground">+1</sup>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Your: {yourSite?.traffic?.source === 'google_analytics' ? '🟢 Google Analytics' : '🔵 SimilarWeb'} |
                    Competitor: 🔵 SimilarWeb
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Line data={trafficChartData} options={trafficChartOptions} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-gray-600 mb-1 font-medium">Your Monthly Visits</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(() => {
                          const visits = yourSite?.traffic?.metrics?.monthlyVisits;
                          console.log('🔍 YOUR Monthly Visits:', visits, typeof visits);
                          if (visits === undefined || visits === null) return 'N/A';
                          if (visits === 0) return <span className="text-orange-500">0<sup className="text-xs ml-1">*</sup></span>;
                          return typeof visits === 'number' ? visits.toLocaleString() : visits;
                        })()}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Bounce: {(() => {
                          const bounce = yourSite?.traffic?.metrics?.bounceRate;
                          console.log('🔍 YOUR Bounce Rate:', bounce);
                          if (bounce === undefined || bounce === null) return 'N/A';
                          // Format as percentage - bounce rate is between 0 and 1
                          return typeof bounce === 'number' ? `${(bounce * 100).toFixed(1)}%` : bounce;
                        })()}
                      </p>
                      {yourSite?.traffic?.metrics?.monthlyVisits === 0 && (
                        <p className="text-[10px] text-orange-600 mt-2 italic">* No traffic data collected yet</p>
                      )}
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-600 mb-1 font-medium">Competitor Monthly Visits</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {(() => {
                          const visits = competitorSite?.traffic?.metrics?.monthlyVisits;
                          console.log('🔍 COMPETITOR Monthly Visits:', visits, typeof visits);
                          if (visits === undefined || visits === null) return 'N/A';
                          return typeof visits === 'number' ? visits.toLocaleString() : visits;
                        })()}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Bounce: {(() => {
                          const bounce = competitorSite?.traffic?.metrics?.bounceRate;
                          console.log('🔍 COMPETITOR Bounce Rate:', bounce);
                          if (bounce === undefined || bounce === null) return 'N/A';
                          // Format as percentage - bounce rate is between 0 and 1
                          return typeof bounce === 'number' ? `${(bounce * 100).toFixed(1)}%` : bounce;
                        })()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SEO Comparison */}
            {showSEOCard && (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    SEO Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-4xl font-bold text-green-600">{comparison.seo.scores?.your || 0}</p>
                        <p className="text-sm text-gray-600 mt-1 font-medium">Your SEO Score</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-4xl font-bold text-blue-600">{comparison.seo.scores?.competitor || 0}</p>
                        <p className="text-sm text-gray-600 mt-1 font-medium">Competitor Score</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Meta Title</span>
                        <div className="flex gap-4">
                          <span>{comparison.seo.metaTags?.your?.hasTitle ? '✅' : '❌'}</span>
                          <span>{comparison.seo.metaTags?.competitor?.hasTitle ? '✅' : '❌'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Meta Description</span>
                        <div className="flex gap-4">
                          <span>{comparison.seo.metaTags?.your?.hasDescription ? '✅' : '❌'}</span>
                          <span>{comparison.seo.metaTags?.competitor?.hasDescription ? '✅' : '❌'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>H1 Headings</span>
                        <div className="flex gap-4">
                          <span className="font-semibold">{comparison.seo.headings?.your?.h1Count || 0}</span>
                          <span className="font-semibold">{comparison.seo.headings?.competitor?.h1Count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Backlinks Analysis */}
            {showBacklinksCard && (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Backlinks Analysis
                    <sup className="text-xs text-muted-foreground">+1</sup>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Your: {yourSite?.backlinks?.source || 'SE Ranking'} |
                    Competitor: {competitorSite?.backlinks?.source || 'SE Ranking'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Line data={backlinksChartData} options={backlinksChartOptions} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Your Total Backlinks</p>
                      <p className="text-xl font-bold text-green-600">
                        {typeof yourSite?.backlinks?.totalBacklinks === 'number'
                          ? yourSite.backlinks.totalBacklinks.toLocaleString()
                          : yourSite?.backlinks?.totalBacklinks || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ref Domains: {yourSite?.backlinks?.totalRefDomains?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Competitor Backlinks</p>
                      <p className="text-xl font-bold text-blue-600">
                        {typeof competitorSite?.backlinks?.totalBacklinks === 'number'
                          ? competitorSite.backlinks.totalBacklinks.toLocaleString()
                          : competitorSite?.backlinks?.totalBacklinks || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ref Domains: {competitorSite?.backlinks?.totalRefDomains?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {comparison?.backlinks && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span>Backlink Advantage</span>
                        <span className={`font-semibold ${comparison.backlinks.winner === 'yours' ? 'text-green-600' :
                          comparison.backlinks.winner === 'competitor' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                          {comparison.backlinks.winner === 'yours' ? 'You lead' :
                            comparison.backlinks.winner === 'competitor' ? 'Competitor leads' : 'Tied'}
                          {comparison.backlinks.difference !== 0 && ` (${Math.abs(comparison.backlinks.difference).toLocaleString()})`}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Market Share (Search Visibility) */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Market Share (Search Visibility)</CardTitle>
                <CardDescription>
                  Calculated using SEO score, traffic, and backlinks metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#e5e7eb"
                        strokeWidth="24"
                        fill="none"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#22c55e"
                        strokeWidth="24"
                        fill="none"
                        strokeDasharray={`${(() => {
                          // Calculate market share using weighted formula
                          const yourSEO = yourSite?.lighthouse?.categories?.seo?.displayValue || 0;
                          const compSEO = competitorSite?.lighthouse?.categories?.seo?.displayValue || 0;
                          const yourTraffic = typeof yourSite?.traffic?.metrics?.monthlyVisits === 'number'
                            ? yourSite.traffic.metrics.monthlyVisits : 0;
                          const compTraffic = typeof competitorSite?.traffic?.metrics?.monthlyVisits === 'number'
                            ? competitorSite.traffic.metrics.monthlyVisits : 0;
                          const yourBacklinks = yourSite?.backlinks?.totalBacklinks || 0;
                          const compBacklinks = competitorSite?.backlinks?.totalBacklinks || 0;

                          // Weighted formula: SEO (40%) + Traffic (35%) + Backlinks (25%)
                          const yourScore = (yourSEO * 0.4) +
                            (Math.min(yourTraffic / 10000, 100) * 0.35) +
                            (Math.min(yourBacklinks / 1000, 100) * 0.25);
                          const compScore = (compSEO * 0.4) +
                            (Math.min(compTraffic / 10000, 100) * 0.35) +
                            (Math.min(compBacklinks / 1000, 100) * 0.25);

                          const totalScore = yourScore + compScore;
                          const yourShare = totalScore > 0 ? (yourScore / totalScore) * 100 : 50;
                          return Math.max(0, Math.min(100, yourShare)) * 5.02;
                        })()} 502`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold text-green-600">
                        {(() => {
                          const yourSEO = yourSite?.lighthouse?.categories?.seo?.displayValue || 0;
                          const compSEO = competitorSite?.lighthouse?.categories?.seo?.displayValue || 0;
                          const yourTraffic = typeof yourSite?.traffic?.metrics?.monthlyVisits === 'number'
                            ? yourSite.traffic.metrics.monthlyVisits : 0;
                          const compTraffic = typeof competitorSite?.traffic?.metrics?.monthlyVisits === 'number'
                            ? competitorSite.traffic.metrics.monthlyVisits : 0;
                          const yourBacklinks = yourSite?.backlinks?.totalBacklinks || 0;
                          const compBacklinks = competitorSite?.backlinks?.totalBacklinks || 0;

                          const yourScore = (yourSEO * 0.4) +
                            (Math.min(yourTraffic / 10000, 100) * 0.35) +
                            (Math.min(yourBacklinks / 1000, 100) * 0.25);
                          const compScore = (compSEO * 0.4) +
                            (Math.min(compTraffic / 10000, 100) * 0.35) +
                            (Math.min(compBacklinks / 1000, 100) * 0.25);

                          const totalScore = yourScore + compScore;
                          return totalScore > 0 ? Math.round((yourScore / totalScore) * 100) : 50;
                        })()}%
                      </div>
                      <div className="text-sm text-muted-foreground">vs 1 competitor</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Your market share</span>
                    <span className="font-semibold text-green-600">
                      {(() => {
                        const yourSEO = yourSite?.lighthouse?.categories?.seo?.displayValue || 0;
                        const compSEO = competitorSite?.lighthouse?.categories?.seo?.displayValue || 0;
                        const yourTraffic = typeof yourSite?.traffic?.metrics?.monthlyVisits === 'number'
                          ? yourSite.traffic.metrics.monthlyVisits : 0;
                        const compTraffic = typeof competitorSite?.traffic?.metrics?.monthlyVisits === 'number'
                          ? competitorSite.traffic.metrics.monthlyVisits : 0;
                        const yourBacklinks = yourSite?.backlinks?.totalBacklinks || 0;
                        const compBacklinks = competitorSite?.backlinks?.totalBacklinks || 0;

                        const yourScore = (yourSEO * 0.4) +
                          (Math.min(yourTraffic / 10000, 100) * 0.35) +
                          (Math.min(yourBacklinks / 1000, 100) * 0.25);
                        const compScore = (compSEO * 0.4) +
                          (Math.min(compTraffic / 10000, 100) * 0.35) +
                          (Math.min(compBacklinks / 1000, 100) * 0.25);

                        const totalScore = yourScore + compScore;
                        const yourShare = totalScore > 0 ? Math.round((yourScore / totalScore) * 100) : 50;
                        return `${yourShare}% ↑`;
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Competitor&apos;s market share</span>
                    <span className="font-semibold text-orange-600">
                      {(() => {
                        const yourSEO = yourSite?.lighthouse?.categories?.seo?.displayValue || 0;
                        const compSEO = competitorSite?.lighthouse?.categories?.seo?.displayValue || 0;
                        const yourTraffic = typeof yourSite?.traffic?.metrics?.monthlyVisits === 'number'
                          ? yourSite.traffic.metrics.monthlyVisits : 0;
                        const compTraffic = typeof competitorSite?.traffic?.metrics?.monthlyVisits === 'number'
                          ? competitorSite.traffic.metrics.monthlyVisits : 0;
                        const yourBacklinks = yourSite?.backlinks?.totalBacklinks || 0;
                        const compBacklinks = competitorSite?.backlinks?.totalBacklinks || 0;

                        const yourScore = (yourSEO * 0.4) +
                          (Math.min(yourTraffic / 10000, 100) * 0.35) +
                          (Math.min(yourBacklinks / 1000, 100) * 0.25);
                        const compScore = (compSEO * 0.4) +
                          (Math.min(compTraffic / 10000, 100) * 0.35) +
                          (Math.min(compBacklinks / 1000, 100) * 0.25);

                        const totalScore = yourScore + compScore;
                        const compShare = totalScore > 0 ? Math.round((compScore / totalScore) * 100) : 50;
                        return `${compShare}%`;
                      })()}
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    View Full Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      }

      {/* Ads Analysis View */}
      {analysisType === 'ads' && (
        <>

          {/* Google Ads Monitoring */}
          {showGoogleAdsCard && (
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  🔍 Google Ads Monitoring
                </CardTitle>
                <CardDescription>
                  Active Google Ads campaigns and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Your Google Ads */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-600" />
                      Your Google Ads
                    </h4>
                    {yourSite?.googleAds ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-xs text-muted-foreground mb-1">Total Active Ads</p>
                          <p className="text-3xl font-bold text-green-700">
                            {yourSite.googleAds.totalAds || 0}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Display Ads</p>
                            <p className="text-xl font-bold">{yourSite.googleAds.displayAds || 0}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Search Ads</p>
                            <p className="text-xl font-bold">{yourSite.googleAds.searchAds || 0}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Estimated Budget</p>
                          <p className="text-lg font-semibold">
                            {yourSite.googleAds.estimatedBudget || '$5-10k/month'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          No Google Ads detected
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Competitor Google Ads */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      Competitor Google Ads
                    </h4>
                    {competitorSite?.googleAds && competitorSite.googleAds.totalAds > 0 ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-muted-foreground mb-1">Total Active Ads</p>
                          <p className="text-3xl font-bold text-blue-700">
                            {competitorSite.googleAds.totalAds || 0}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Display Ads</p>
                            <p className="text-xl font-bold">{competitorSite.googleAds.displayAds || 0}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Search Ads</p>
                            <p className="text-xl font-bold">{competitorSite.googleAds.searchAds || 0}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Estimated Budget</p>
                          <p className="text-lg font-semibold">
                            {competitorSite.googleAds.estimatedBudget || '$3-8k/month'}
                          </p>
                        </div>
                        {competitorSite.googleAds.topKeywords && (
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-xs text-muted-foreground mb-2">Top Keywords</p>
                            <div className="flex flex-wrap gap-1">
                              {competitorSite.googleAds?.topKeywords?.slice(0, 5).map((keyword: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">{keyword}</Badge>
                              )) || []}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          No Google Ads detected for competitor
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meta Ads Monitoring */}
          {showMetaAdsCard && (
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  📱 Meta Ads Monitoring (Facebook & Instagram)
                </CardTitle>
                <CardDescription>
                  Active Meta Ads campaigns across Facebook and Instagram
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Your Meta Ads */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-600" />
                      Your Meta Ads
                    </h4>
                    {yourSite?.metaAds ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-xs text-muted-foreground mb-1">Total Active Ads</p>
                          <p className="text-3xl font-bold text-green-700">
                            {yourSite.metaAds.totalAds || 0}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Facebook Ads</p>
                            <p className="text-xl font-bold">{yourSite.metaAds.facebookAds || 0}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Instagram Ads</p>
                            <p className="text-xl font-bold">{yourSite.metaAds.instagramAds || 0}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Estimated Spend</p>
                          <p className="text-lg font-semibold">
                            {yourSite.metaAds.estimatedSpend || '$3-7k/month'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          No Meta Ads detected
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Competitor Meta Ads */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      Competitor Meta Ads
                    </h4>
                    {competitorSite?.metaAds && competitorSite.metaAds.totalAds > 0 ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-muted-foreground mb-1">Total Active Ads</p>
                          <p className="text-3xl font-bold text-blue-700">
                            {competitorSite.metaAds.totalAds || 0}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Facebook Ads</p>
                            <p className="text-xl font-bold">{competitorSite.metaAds.facebookAds || 0}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Instagram Ads</p>
                            <p className="text-xl font-bold">{competitorSite.metaAds.instagramAds || 0}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Estimated Spend</p>
                          <p className="text-lg font-semibold">
                            {competitorSite.metaAds.estimatedSpend || '$2-6k/month'}
                          </p>
                        </div>
                        {competitorSite.metaAds.adFormats && (
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-xs text-muted-foreground mb-2">Ad Formats</p>
                            <div className="flex flex-wrap gap-1">
                              {competitorSite.metaAds?.adFormats?.slice(0, 5).map((format: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">{format}</Badge>
                              )) || []}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          No Meta Ads detected for competitor
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Content Analysis View */}
      {analysisType === 'content' && (
        <>
          {/* Content Updates from ChangeDetection.io */}
          {showContentChangesCard && (
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gray-900" />
                  Content Updates (ChangeDetection.io)
                </CardTitle>
                <CardDescription>
                  Real-time monitoring of content changes on both websites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Your Site Updates */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-600" />
                        Your Site Updates
                      </h4>
                      {yourSite?.contentChanges?.success && (
                        <Badge variant="outline" className="bg-green-50">Monitoring Active</Badge>
                      )}
                    </div>
                    {yourSite?.contentChanges?.success ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-xs text-muted-foreground mb-1">Activity Level</p>
                          <p className="text-2xl font-bold text-green-700 capitalize">
                            {yourSite.contentChanges.activity?.activityLevel || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {yourSite.contentChanges.activity?.changeFrequency || 'N/A'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Total Checks</p>
                            <p className="text-xl font-bold">{yourSite.contentChanges.monitoring?.checkCount || 0}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Changes Found</p>
                            <p className="text-xl font-bold text-green-600">
                              {yourSite.contentChanges.monitoring?.changeCount || 0}
                            </p>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Last Update</p>
                          <p className="text-sm font-semibold">
                            {yourSite.contentChanges.activity?.daysSinceLastChange !== null
                              ? `${yourSite.contentChanges.activity.daysSinceLastChange} days ago`
                              : 'Never'}
                          </p>
                        </div>
                        {yourSite.contentChanges.history && yourSite.contentChanges.history.length > 0 && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-muted-foreground mb-2">Recent Changes</p>
                            <div className="space-y-1">
                              {yourSite.contentChanges?.history?.slice(0, 3).map((change: any, idx: number) => (
                                <p key={idx} className="text-xs">
                                  📝 {new Date(change.timestamp * 1000).toLocaleDateString()}
                                </p>
                              )) || []}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Content monitoring not enabled for your site
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Competitor Updates */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        Competitor Updates
                      </h4>
                      {competitorSite?.contentChanges?.success && (
                        <Badge variant="outline" className="bg-blue-50">Monitoring Active</Badge>
                      )}
                    </div>
                    {competitorSite?.contentChanges?.success ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-muted-foreground mb-1">Activity Level</p>
                          <p className="text-2xl font-bold text-blue-700 capitalize">
                            {competitorSite.contentChanges.activity?.activityLevel || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {competitorSite.contentChanges.activity?.changeFrequency || 'N/A'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Total Checks</p>
                            <p className="text-xl font-bold">{competitorSite.contentChanges.monitoring?.checkCount || 0}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Changes Found</p>
                            <p className="text-xl font-bold text-blue-600">
                              {competitorSite.contentChanges.monitoring?.changeCount || 0}
                            </p>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Last Update</p>
                          <p className="text-sm font-semibold">
                            {competitorSite.contentChanges.activity?.daysSinceLastChange !== null
                              ? `${competitorSite.contentChanges.activity.daysSinceLastChange} days ago`
                              : 'Never'}
                          </p>
                        </div>
                        {competitorSite.contentChanges.history && competitorSite.contentChanges.history.length > 0 && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-muted-foreground mb-2">Recent Changes</p>
                            <div className="space-y-1">
                              {competitorSite.contentChanges?.history?.slice(0, 3).map((change: any, idx: number) => (
                                <p key={idx} className="text-xs">
                                  📝 {new Date(change.timestamp * 1000).toLocaleDateString()}
                                </p>
                              )) || []}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Content monitoring not enabled for competitor
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Static Content Analysis */}
          {showContentCard && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Content Analysis - Your Site
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">Word Count</span>
                      <span className="font-bold text-green-700">
                        {comparison?.content?.your?.wordCount?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Images</span>
                      <span className="font-semibold">{comparison?.content?.your?.imageCount || 0}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Alt Text Coverage</span>
                      <span className="font-semibold">{comparison?.content?.your?.imageAltCoverage || 0}%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Total Links</span>
                      <span className="font-semibold">{comparison?.content?.your?.totalLinks || 0}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Internal / External</span>
                      <span className="font-semibold">
                        {comparison?.content?.your?.internalLinks || 0} / {comparison?.content?.your?.externalLinks || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Content Analysis - Competitor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm">Word Count</span>
                      <span className="font-bold text-blue-700">
                        {comparison?.content?.competitor?.wordCount?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Images</span>
                      <span className="font-semibold">{comparison?.content?.competitor?.imageCount || 0}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Alt Text Coverage</span>
                      <span className="font-semibold">{comparison?.content?.competitor?.imageAltCoverage || 0}%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Total Links</span>
                      <span className="font-semibold">{comparison?.content?.competitor?.totalLinks || 0}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Internal / External</span>
                      <span className="font-semibold">
                        {comparison?.content?.competitor?.internalLinks || 0} / {comparison?.content?.competitor?.externalLinks || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Social Media View */}
      {analysisType === 'social' && (
        <>
          {showInstagramCard || showFacebookCard ? (
            <>
              {/* Instagram Engagement */}
              {showInstagramCard && (
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <InstagramIcon className="h-4 w-4 text-gray-900" />
                      Instagram Engagement Analysis
                    </CardTitle>
                    <CardDescription>
                      Follower growth, engagement rates, and posting activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Your Instagram */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4 text-green-600" />
                          Your Instagram
                        </h4>
                        {yourSite?.instagram?.profile ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-xs text-muted-foreground mb-1">Followers</p>
                                <p className="text-2xl font-bold text-green-700">
                                  {yourSite.instagram.profile.followers?.toLocaleString() || '0'}
                                </p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Avg Interactions</p>
                                <p className="text-2xl font-bold">{yourSite.instagram.profile.avgInteractions?.toLocaleString() || '0'}</p>
                              </div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-xs text-muted-foreground mb-1">Engagement Rate</p>
                              <p className="text-3xl font-bold text-purple-700">
                                {yourSite.instagram.profile.avgEngagementRate !== undefined && yourSite.instagram.profile.avgEngagementRate !== null
                                  ? `${(yourSite.instagram.profile.avgEngagementRate * 100).toFixed(2)}%`
                                  : yourSite.instagram.engagement?.summary?.engagementRate || 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">Avg. likes + comments per post</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Avg. Likes</p>
                                <p className="text-lg font-bold">
                                  {yourSite.instagram.engagement?.summary?.avgLikesPerPost !== undefined
                                    ? yourSite.instagram.engagement.summary.avgLikesPerPost.toLocaleString()
                                    : 'N/A'}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Avg. Comments</p>
                                <p className="text-lg font-bold">
                                  {yourSite.instagram.engagement?.summary?.avgCommentsPerPost !== undefined
                                    ? yourSite.instagram.engagement.summary.avgCommentsPerPost.toLocaleString()
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Best Posting Days</p>
                              <div className="flex flex-wrap gap-1">
                                {yourSite.instagram.engagement?.postingPattern?.bestDays?.slice(0, 3).map((day: any, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">{day.day}</Badge>
                                )) || <span className="text-xs">N/A</span>}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              Instagram not connected
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {/* Competitor Instagram */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          Competitor Instagram
                        </h4>
                        {competitorSite?.instagram?.profile ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-muted-foreground mb-1">Followers</p>
                                <p className="text-2xl font-bold text-blue-700">
                                  {competitorSite.instagram.profile.followers?.toLocaleString() || '0'}
                                </p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Avg Interactions</p>
                                <p className="text-2xl font-bold">{competitorSite.instagram.profile.avgInteractions?.toLocaleString() || '0'}</p>
                              </div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-xs text-muted-foreground mb-1">Engagement Rate</p>
                              <p className="text-3xl font-bold text-purple-700">
                                {competitorSite.instagram.profile.avgEngagementRate !== undefined && competitorSite.instagram.profile.avgEngagementRate !== null
                                  ? `${(competitorSite.instagram.profile.avgEngagementRate * 100).toFixed(2)}%`
                                  : competitorSite.instagram.engagement?.summary?.engagementRate || 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">Avg. likes + comments per post</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Avg. Likes</p>
                                <p className="text-lg font-bold">
                                  {competitorSite.instagram.engagement?.summary?.avgLikesPerPost !== undefined
                                    ? competitorSite.instagram.engagement.summary.avgLikesPerPost.toLocaleString()
                                    : 'N/A'}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Avg. Comments</p>
                                <p className="text-lg font-bold">
                                  {competitorSite.instagram.engagement?.summary?.avgCommentsPerPost !== undefined
                                    ? competitorSite.instagram.engagement.summary.avgCommentsPerPost.toLocaleString()
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Best Posting Days</p>
                              <div className="flex flex-wrap gap-1">
                                {competitorSite.instagram.engagement?.postingPattern?.bestDays?.slice(0, 3).map((day: any, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">{day.day}</Badge>
                                )) || <span className="text-xs">N/A</span>}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              Competitor Instagram data not available
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Facebook Engagement */}
              {showFacebookCard && (
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <FacebookIcon className="h-4 w-4 text-gray-900" />
                      Facebook Engagement Analysis
                    </CardTitle>
                    <CardDescription>
                      Page likes, follower growth, and engagement metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Your Facebook */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4 text-green-600" />
                          Your Facebook
                        </h4>
                        {yourSite?.facebook?.profile ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-xs text-muted-foreground mb-1">Page Likes</p>
                                <p className="text-2xl font-bold text-green-700">
                                  {yourSite.facebook.profile.likes?.toLocaleString() || '0'}
                                </p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Followers</p>
                                <p className="text-2xl font-bold">
                                  {yourSite.facebook.metrics?.followers?.toLocaleString() || '0'}
                                </p>
                              </div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-xs text-muted-foreground mb-1">Engagement Rate</p>
                              <p className="text-3xl font-bold text-purple-700">
                                {yourSite.facebook.profile.avgEngagementRate
                                  ? `${(yourSite.facebook.profile.avgEngagementRate * 100).toFixed(2)}%`
                                  : 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">Reactions + comments + shares</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Reactions</p>
                                <p className="text-lg font-bold">
                                  {yourSite.facebook.engagement?.summary?.avgReactionsPerPost?.toLocaleString() || 'N/A'}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Comments</p>
                                <p className="text-lg font-bold">
                                  {yourSite.facebook.engagement?.summary?.avgCommentsPerPost?.toLocaleString() || 'N/A'}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Shares</p>
                                <p className="text-lg font-bold">
                                  {yourSite.facebook.engagement?.summary?.avgSharesPerPost?.toLocaleString() || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Talking About</p>
                              <p className="text-lg font-semibold">
                                {yourSite.facebook.metrics?.talkingAbout?.toLocaleString() || 'N/A'} people
                              </p>
                            </div>
                          </div>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              Facebook not connected
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {/* Competitor Facebook */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          Competitor Facebook
                        </h4>
                        {competitorSite?.facebook?.profile ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-muted-foreground mb-1">Page Likes</p>
                                <p className="text-2xl font-bold text-blue-700">
                                  {competitorSite.facebook.profile.likes?.toLocaleString() || '0'}
                                </p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Followers</p>
                                <p className="text-2xl font-bold">
                                  {competitorSite.facebook.metrics?.followers?.toLocaleString() || '0'}
                                </p>
                              </div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-xs text-muted-foreground mb-1">Engagement Rate</p>
                              <p className="text-3xl font-bold text-purple-700">
                                {competitorSite.facebook.profile.avgEngagementRate
                                  ? `${(competitorSite.facebook.profile.avgEngagementRate * 100).toFixed(2)}%`
                                  : 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">Reactions + comments + shares</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Reactions</p>
                                <p className="text-lg font-bold">
                                  {competitorSite.facebook.engagement?.summary?.avgReactionsPerPost?.toLocaleString() || 'N/A'}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Comments</p>
                                <p className="text-lg font-bold">
                                  {competitorSite.facebook.engagement?.summary?.avgCommentsPerPost?.toLocaleString() || 'N/A'}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Shares</p>
                                <p className="text-lg font-bold">
                                  {competitorSite.facebook.engagement?.summary?.avgSharesPerPost?.toLocaleString() || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Talking About</p>
                              <p className="text-lg font-semibold">
                                {competitorSite.facebook.metrics?.talkingAbout?.toLocaleString() || 'N/A'} people
                              </p>
                            </div>
                          </div>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              Competitor Facebook data not available
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* LinkedIn Engagement */}
              {(yourSite?.linkedin || competitorSite?.linkedin) && (
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-900" />
                      LinkedIn Company Analysis
                    </CardTitle>
                    <CardDescription>
                      Company followers, post engagement, and reputation score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Your LinkedIn */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4 text-green-600" />
                          Your LinkedIn
                        </h4>
                        {yourSite?.linkedin?.dataAvailable ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-xs text-muted-foreground mb-1">Followers</p>
                                <p className="text-2xl font-bold text-green-700">
                                  {yourSite.linkedin.companyFollowers?.toLocaleString() || '0'}
                                </p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Posts Analyzed</p>
                                <p className="text-2xl font-bold">{yourSite.linkedin.scrapedPostsCount || '0'}</p>
                              </div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-xs text-muted-foreground mb-1">Engagement Rate</p>
                              <p className="text-3xl font-bold text-purple-700">
                                {yourSite.linkedin.engagementScore?.engagementRate?.toFixed(2) || '0'}%
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">Likes + comments + shares</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Likes</p>
                                <p className="text-lg font-bold">
                                  {yourSite.linkedin.engagementScore?.likes?.toLocaleString() || '0'}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Comments</p>
                                <p className="text-lg font-bold">
                                  {yourSite.linkedin.engagementScore?.comments?.toLocaleString() || '0'}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Shares</p>
                                <p className="text-lg font-bold">
                                  {yourSite.linkedin.engagementScore?.shares?.toLocaleString() || '0'}
                                </p>
                              </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Reputation Score</p>
                              <p className="text-2xl font-semibold">
                                {yourSite.linkedin.reputationBenchmark?.score || '0'}/100
                              </p>
                              <Badge variant="outline" className="mt-1">
                                {yourSite.linkedin.reputationBenchmark?.sentiment || 'N/A'}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              LinkedIn not connected
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {/* Competitor LinkedIn */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          Competitor LinkedIn
                        </h4>
                        {competitorSite?.linkedin?.dataAvailable ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-muted-foreground mb-1">Followers</p>
                                <p className="text-2xl font-bold text-blue-700">
                                  {competitorSite.linkedin.companyFollowers?.toLocaleString() || '0'}
                                </p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Posts Analyzed</p>
                                <p className="text-2xl font-bold">{competitorSite.linkedin.scrapedPostsCount || '0'}</p>
                              </div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-xs text-muted-foreground mb-1">Engagement Rate</p>
                              <p className="text-3xl font-bold text-purple-700">
                                {competitorSite.linkedin.engagementScore?.engagementRate?.toFixed(2) || '0'}%
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">Likes + comments + shares</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Likes</p>
                                <p className="text-lg font-bold">
                                  {competitorSite.linkedin.engagementScore?.likes?.toLocaleString() || '0'}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Comments</p>
                                <p className="text-lg font-bold">
                                  {competitorSite.linkedin.engagementScore?.comments?.toLocaleString() || '0'}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Shares</p>
                                <p className="text-lg font-bold">
                                  {competitorSite.linkedin.engagementScore?.shares?.toLocaleString() || '0'}
                                </p>
                              </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Reputation Score</p>
                              <p className="text-2xl font-semibold">
                                {competitorSite.linkedin.reputationBenchmark?.score || '0'}/100
                              </p>
                              <Badge variant="outline" className="mt-1">
                                {competitorSite.linkedin.reputationBenchmark?.sentiment || 'N/A'}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              Competitor LinkedIn data not available
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <InstagramIcon className="h-4 w-4 text-gray-900" />
                  Social Media Analysis
                </CardTitle>
                <CardDescription>
                  No social media data available for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Social Media Data Unavailable</AlertTitle>
                  <AlertDescription>
                    Social media analysis is currently unavailable due to API rate limits or authentication issues.
                    Please try again later or contact support if the issue persists.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Technical Analysis View */}
      {analysisType === 'technical' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Technology Stack */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-600" />
                      Your Site
                    </h4>
                    <div className="space-y-3">
                      {(() => {
                        console.log('🔧 YOUR puppeteer.technology:', yourSite?.puppeteer?.technology);
                        console.log('🔧 YOUR comparison.technology.your:', comparison?.technology?.your);

                        const tech = yourSite?.puppeteer?.technology || comparison?.technology?.your;
                        const hasAnyTech = tech && (
                          tech.cms ||
                          (tech.frameworks && tech.frameworks.length > 0) ||
                          (tech.analytics && tech.analytics.length > 0) ||
                          (tech.thirdPartyScripts && tech.thirdPartyScripts.length > 0)
                        );

                        if (!hasAnyTech) {
                          return <p className="text-sm text-muted-foreground">No technologies detected</p>;
                        }

                        return (
                          <div className="space-y-2">
                            {tech.cms && (
                              <div>
                                <div className="text-xs text-gray-600 mb-1">CMS</div>
                                <Badge variant="outline" className="text-xs">{tech.cms}</Badge>
                              </div>
                            )}

                            {tech.frameworks && tech.frameworks.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Frameworks</div>
                                <div className="flex flex-wrap gap-1">
                                  {tech.frameworks?.map((fw: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{fw}</Badge>
                                  )) || []}
                                </div>
                              </div>
                            )}

                            {tech.analytics && tech.analytics.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Analytics</div>
                                <div className="flex flex-wrap gap-1">
                                  {tech.analytics?.map((tool: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-blue-50">{tool}</Badge>
                                  )) || []}
                                </div>
                              </div>
                            )}

                            {tech.thirdPartyScripts && tech.thirdPartyScripts.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Third-party Services</div>
                                <div className="flex flex-wrap gap-1">
                                  {tech.thirdPartyScripts?.slice(0, 3).map((script: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-gray-50">{script}</Badge>
                                  )) || []}
                                  {(tech.thirdPartyScripts?.length || 0) > 3 && (
                                    <Badge variant="outline" className="text-xs bg-gray-50">+{(tech.thirdPartyScripts?.length || 0) - 3} more</Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      Competitor
                    </h4>
                    <div className="space-y-3">
                      {(() => {
                        console.log('🔧 COMPETITOR puppeteer.technology:', competitorSite?.puppeteer?.technology);
                        console.log('🔧 COMPETITOR comparison.technology.competitor:', comparison?.technology?.competitor);

                        const tech = competitorSite?.puppeteer?.technology || comparison?.technology?.competitor;
                        const hasAnyTech = tech && (
                          tech.cms ||
                          (tech.frameworks && tech.frameworks.length > 0) ||
                          (tech.analytics && tech.analytics.length > 0) ||
                          (tech.thirdPartyScripts && tech.thirdPartyScripts.length > 0)
                        );

                        if (!hasAnyTech) {
                          return <p className="text-sm text-muted-foreground">No technologies detected</p>;
                        }

                        return (
                          <div className="space-y-2">
                            {tech.cms && (
                              <div>
                                <div className="text-xs text-gray-600 mb-1">CMS</div>
                                <Badge variant="outline" className="text-xs">{tech.cms}</Badge>
                              </div>
                            )}

                            {tech.frameworks && tech.frameworks.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Frameworks</div>
                                <div className="flex flex-wrap gap-1">
                                  {tech.frameworks?.map((fw: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{fw}</Badge>
                                  )) || []}
                                </div>
                              </div>
                            )}

                            {tech.analytics && tech.analytics.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Analytics</div>
                                <div className="flex flex-wrap gap-1">
                                  {tech.analytics?.map((tool: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-blue-50">{tool}</Badge>
                                  )) || []}
                                </div>
                              </div>
                            )}

                            {tech.thirdPartyScripts && tech.thirdPartyScripts.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Third-party Services</div>
                                <div className="flex flex-wrap gap-1">
                                  {tech.thirdPartyScripts?.slice(0, 3).map((script: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-gray-50">{script}</Badge>
                                  )) || []}
                                  {(tech.thirdPartyScripts?.length || 0) > 3 && (
                                    <Badge variant="outline" className="text-xs bg-gray-50">+{(tech.thirdPartyScripts?.length || 0) - 3} more</Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Security & SEO Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-3">Your Site</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>HTTPS</span>
                        <span>{comparison?.security?.your?.https ? '✅' : '❌'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Robots.txt</span>
                        <span>{comparison?.security?.your?.hasRobotsTxt ? '✅' : '❌'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Sitemap</span>
                        <span>{comparison?.security?.your?.hasSitemap ? '✅' : '❌'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Competitor</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>HTTPS</span>
                        <span>{comparison?.security?.competitor?.https ? '✅' : '❌'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Robots.txt</span>
                        <span>{comparison?.security?.competitor?.hasRobotsTxt ? '✅' : '❌'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Sitemap</span>
                        <span>{comparison?.security?.competitor?.hasSitemap ? '✅' : '❌'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Show Performance Comparison only in Technical view */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

            {/* Your Site Performance */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Globe className="h-4 w-4 text-gray-900" />
                  {yourSite?.domain || 'Your Site'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <ScoreCircle
                    label="Performance"
                    score={yourSite?.lighthouse?.categories?.performance?.displayValue || 0}
                    icon={<Zap className="h-4 w-4" />}
                  />
                  <ScoreCircle
                    label="Accessibility"
                    score={yourSite?.lighthouse?.categories?.accessibility?.displayValue || 0}
                    icon={<Shield className="h-4 w-4" />}
                  />
                  <ScoreCircle
                    label="Best Practices"
                    score={yourSite?.lighthouse?.categories?.['best-practices']?.displayValue || 0}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                  />
                  <ScoreCircle
                    label="SEO"
                    score={yourSite?.lighthouse?.categories?.seo?.displayValue || 0}
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Competitor Performance */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Target className="h-4 w-4 text-gray-900" />
                  {competitorSite?.domain || 'Competitor'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <ScoreCircle
                    label="Performance"
                    score={competitorSite?.lighthouse?.categories?.performance?.displayValue || 0}
                    icon={<Zap className="h-4 w-4" />}
                  />
                  <ScoreCircle
                    label="Accessibility"
                    score={competitorSite?.lighthouse?.categories?.accessibility?.displayValue || 0}
                    icon={<Shield className="h-4 w-4" />}
                  />
                  <ScoreCircle
                    label="Best Practices"
                    score={competitorSite?.lighthouse?.categories?.['best-practices']?.displayValue || 0}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                  />
                  <ScoreCircle
                    label="SEO"
                    score={competitorSite?.lighthouse?.categories?.seo?.displayValue || 0}
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Remove the duplicate Social Media section that appears after technical view */}
      {false && (showInstagramCard || showFacebookCard) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Social Media Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Social Media Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {showInstagramCard && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <InstagramIcon className="h-4 w-4" />
                      Instagram
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Your Stats:</p>
                        {yourSite?.instagram ? (
                          <div className="space-y-1">
                            <p>Followers: {yourSite.instagram.followers?.toLocaleString() || 'N/A'}</p>
                            <p>Posts: {yourSite.instagram.posts || 'N/A'}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Not connected</p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Competitor:</p>
                        {competitorSite?.instagram ? (
                          <div className="space-y-1">
                            <p>Followers: {competitorSite.instagram.followers?.toLocaleString() || 'N/A'}</p>
                            <p>Posts: {competitorSite.instagram.posts || 'N/A'}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Not available</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {showFacebookCard && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FacebookIcon className="h-4 w-4" />
                      Facebook
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Your Stats:</p>
                        {yourSite?.facebook ? (
                          <div className="space-y-1">
                            <p>Likes: {yourSite.facebook.likes?.toLocaleString() || 'N/A'}</p>
                            <p>Followers: {yourSite.facebook.followers?.toLocaleString() || 'N/A'}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Not connected</p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Competitor:</p>
                        {competitorSite?.facebook ? (
                          <div className="space-y-1">
                            <p>Likes: {competitorSite.facebook.likes?.toLocaleString() || 'N/A'}</p>
                            <p>Followers: {competitorSite.facebook.followers?.toLocaleString() || 'N/A'}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Not available</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights Hub Link */}
      <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 shadow-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Get AI-Powered Insights
          </CardTitle>
          <CardDescription className="text-gray-600">
            Generate personalized recommendations based on this competitor analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={() => window.location.href = '/dashboard/ai-insights'}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Go to AI Insights Hub
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Score Circle Component
function ScoreCircle({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const getColor = (score: number) => {
    if (score >= 80) return { stroke: '#10b981', bg: 'bg-green-50', text: 'text-green-600' }
    if (score >= 50) return { stroke: '#f59e0b', bg: 'bg-yellow-50', text: 'text-yellow-600' }
    return { stroke: '#ef4444', bg: 'bg-red-50', text: 'text-red-600' }
  }

  const { stroke, bg, text } = getColor(score)
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={`flex flex-col items-center p-4 ${bg} rounded-lg`}>
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke={stroke}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${text}`}>{score}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-600">
        {icon}
        {label}
      </div>
    </div>
  )
}
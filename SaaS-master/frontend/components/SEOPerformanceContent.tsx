'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Loader2, 
  Globe, 
  AlertCircle, 
  TrendingUp, 
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Shield,
  Eye,
  Code,
  Lock
} from 'lucide-react'
import { generatePDFReport } from '@/utils/pdfGenerator'
import CoreWebVitalsDisplay from '@/components/charts/CoreWebVitalsDisplay'

interface SEOPerformanceContentProps {
  user: any
}

const loadingFacts = [
  "🚀 Running comprehensive website audit...",
  "🔍 Analyzing 100+ SEO factors...",
  "⚡ Testing page load performance...",
  "🎯 Checking mobile responsiveness...",
  "📊 Measuring Core Web Vitals...",
  "🔒 Validating security headers...",
]

export default function SEOPerformanceContent({ user }: SEOPerformanceContentProps) {
  const [url, setUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [lighthouseData, setLighthouseData] = useState<any>(null)
  const [error, setError] = useState('')
  const [currentFact, setCurrentFact] = useState(0)

  const analyzeWebsite = async () => {
    if (!url) return

    setAnalyzing(true)
    setError('')
    setAnalysisResult(null)
    setLighthouseData(null)
    setCurrentFact(0)

    const factInterval = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % loadingFacts.length)
    }, 3000)

    try {
      const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')

      const healthResponse = await fetch('http://localhost:3010/api/health/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanUrl })
      })

      if (!healthResponse.ok) throw new Error('Failed to analyze website')

      const healthData = await healthResponse.json()
      setAnalysisResult(healthData)

      try {
        const lighthouseResponse = await fetch(`http://localhost:3010/api/lighthouse/${cleanUrl}`)
        if (lighthouseResponse.ok) {
          const lighthouseJson = await lighthouseResponse.json()
          setLighthouseData(lighthouseJson)
        }
      } catch (err) {
        console.warn('Lighthouse data not available')
      }

    } catch (err: any) {
      setError(err.message || 'Failed to analyze website')
    } finally {
      clearInterval(factInterval)
      setAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-orange-500'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Good'
    if (score >= 50) return 'Needs improvement'
    return 'Poor'
  }

  const getIssuesCounts = () => {
    if (!lighthouseData) return { errors: 0, warnings: 0, notices: 0 }
    
    const errors = lighthouseData.opportunities?.filter((opp: any) => opp.score < 0.5).length || 0
    const warnings = lighthouseData.opportunities?.length || 0
    const notices = Object.values(lighthouseData.seoAnalysis || {}).filter((item: any) => !item.passed).length || 0
    
    return { errors, warnings, notices }
  }

  const handleDownloadPDF = async () => {
    if (!analysisResult || !lighthouseData) return
    
    try {
      await generatePDFReport(analysisResult, lighthouseData, [])
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF report')
    }
  }

  const renderCircularScore = (score: number, size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizes = {
      small: { width: 60, height: 60, cx: 30, cy: 30, radius: 24, strokeWidth: 5, circumference: 150.8 },
      medium: { width: 80, height: 80, cx: 40, cy: 40, radius: 32, strokeWidth: 6, circumference: 201.06 },
      large: { width: 100, height: 100, cx: 50, cy: 50, radius: 40, strokeWidth: 7, circumference: 251.33 }
    }
    
    const { width, height, cx, cy, radius, strokeWidth, circumference } = sizes[size]
    const progress = (score / 100) * circumference

    return (
      <div className="relative flex-shrink-0" style={{ width, height }}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={getScoreBgColor(score)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${size === 'large' ? 'text-2xl' : size === 'medium' ? 'text-xl' : 'text-base'} font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-[10px] text-gray-500">/100</span>
        </div>
      </div>
    )
  }

  if (!analysisResult || !lighthouseData) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">SEO & Website Performance</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Comprehensive analysis of your website&apos;s performance and SEO</p>
          </div>

          {/* Search Bar */}
          <Card className="border-gray-200 mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter website URL (e.g., example.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && analyzeWebsite()}
                    disabled={analyzing}
                    className="pl-10 h-12 border-gray-300"
                  />
                </div>
                <Button
                  onClick={analyzeWebsite}
                  disabled={analyzing || !url}
                  className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 mt-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700 break-words">{error}</p>
                </div>
              )}

              {analyzing && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                    <p className="text-sm font-medium text-blue-900 break-words">
                      {loadingFacts[currentFact]}
                    </p>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: '100%' }} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Empty State */}
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Globe className="w-20 h-20 text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Comprehensive SEO Analysis
              </h3>
              <p className="text-gray-600 text-center max-w-md mb-6">
                Enter your website URL above to get a detailed SEO and performance analysis with actionable insights
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Performance Metrics
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  SEO Analysis
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Accessibility Check
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Best Practices
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { errors, warnings, notices } = getIssuesCounts()

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">SEO & Website Performance</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Comprehensive analysis of your website&apos;s performance and SEO</p>
        </div>

        {/* Search Bar */}
        <Card className="border-gray-200 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter website URL (e.g., example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && analyzeWebsite()}
                  disabled={analyzing}
                  className="pl-10 h-12 border-gray-300"
                />
              </div>
              <Button
                onClick={analyzeWebsite}
                disabled={analyzing || !url}
                className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <div className="space-y-6">
          {/* Header with Download Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
              <p className="text-sm text-gray-600 mt-1 truncate max-w-full">Analyzed: {url}</p>
            </div>
            <Button
              onClick={handleDownloadPDF}
              className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>

          {/* Overview Cards with Circular Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Overall Score */}
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {renderCircularScore(analysisResult.overall_score, 'large')}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Overall Score</p>
                    <p className="text-xs text-gray-500">{getScoreLabel(analysisResult.overall_score)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {renderCircularScore(lighthouseData.categoryScores.performance, 'large')}
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <p className="text-sm font-medium text-gray-600">Performance</p>
                    </div>
                    <p className="text-xs text-gray-500">{getScoreLabel(lighthouseData.categoryScores.performance)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {renderCircularScore(lighthouseData.categoryScores.seo, 'large')}
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-gray-600">SEO</p>
                    </div>
                    <p className="text-xs text-gray-500">{getScoreLabel(lighthouseData.categoryScores.seo)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility */}
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {renderCircularScore(lighthouseData.categoryScores.accessibility, 'large')}
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Eye className="w-4 h-4 text-purple-600" />
                      <p className="text-sm font-medium text-gray-600">Accessibility</p>
                    </div>
                    <p className="text-xs text-gray-500">{getScoreLabel(lighthouseData.categoryScores.accessibility)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Core Web Vitals */}
          <CoreWebVitalsDisplay data={lighthouseData} />

          {/* Additional Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Site Audit Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Site Audit</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Issues found during analysis</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900">Errors</span>
                    </div>
                    <span className="text-xl font-bold text-red-600 flex-shrink-0 ml-2">{errors}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900">Warnings</span>
                    </div>
                    <span className="text-xl font-bold text-orange-600 flex-shrink-0 ml-2">{warnings}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900">Notices</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600 flex-shrink-0 ml-2">{notices}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Additional Scores</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Detailed category breakdown</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Shield className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 truncate">Best Practices</span>
                    </div>
                    <div className="flex-shrink-0">
                      {renderCircularScore(lighthouseData.categoryScores.bestPractices, 'small')}
                    </div>
                  </div>
                  
                  {analysisResult.breakdown && Object.entries(analysisResult.breakdown).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Code className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 capitalize truncate">
                          {key.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        {renderCircularScore(value, 'small')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Opportunities */}
          {lighthouseData.opportunities && lighthouseData.opportunities.length > 0 && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Optimization Opportunities</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Actionable improvements to boost your performance</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lighthouseData.opportunities.slice(0, 8).map((opp: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 break-words">{opp.title}</h4>
                          <p className="text-sm text-gray-600 mb-2 break-words">{opp.description}</p>
                          {opp.savings && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm font-medium text-green-700">
                                Potential savings: ~{(opp.savings / 1000).toFixed(2)}s
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Premium Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200 bg-gray-50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-sm z-10 flex items-center justify-center p-4">
                <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-sm">
                  <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Feature</h3>
                  <p className="text-sm text-gray-600 mb-4">Keyword ranking tracking requires premium subscription</p>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto">
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-400">Keyword Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p className="text-center px-4">Requires Google Search Console integration</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gray-50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-sm z-10 flex items-center justify-center p-4">
                <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-sm">
                  <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Feature</h3>
                  <p className="text-sm text-gray-600 mb-4">Backlink analysis requires premium subscription</p>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto">
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-400">Backlink Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p className="text-center px-4">Requires Ahrefs or Moz API integration</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
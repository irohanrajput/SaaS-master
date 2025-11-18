'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, BarChart3, TrendingUp, Users, Calendar, Target, Globe, Zap, Shield, ChevronRight, Trash2, RefreshCw, Clock } from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'

interface SavedReport {
  id: string
  report_type: string
  report_title: string
  created_at: string
  metrics_summary: any
  status: string
}

export default function ReportsPage() {
  const {
    plan,
    usage,
    getLimit,
    incrementUsage,
    isWithinLimit
  } = useSubscription()

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingType, setGeneratingType] = useState<string | null>(null)
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const [userEmail, setUserEmail] = useState<string>('')
  const [userDomain, setUserDomain] = useState('')
  const [loadingReports, setLoadingReports] = useState(true)

  const maxReports = getLimit('reports')
  const currentUsage = usage.reportsThisMonth
  const remainingReports = maxReports - currentUsage
  const canGenerateReports = isWithinLimit('reports')

  // Get user email on mount
  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
        await loadSavedReports(user.email)
        await loadUserBusinessInfo(user.email)
      }
      setLoadingReports(false)
    }
    init()
  }, [])

  // Load user business info to get domain
  const loadUserBusinessInfo = async (email: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/business-info?email=${encodeURIComponent(email)}`)
      if (response.data.success && response.data.data?.business_domain) {
        setUserDomain(response.data.data.business_domain)
        console.log(`✅ Loaded user domain: ${response.data.data.business_domain}`)
      }
    } catch (error) {
      console.error('❌ Failed to load user business info:', error)
    }
  }

  // Load saved reports from backend
  const loadSavedReports = async (email: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/reports/list?email=${encodeURIComponent(email)}`)
      if (response.data.success) {
        setSavedReports(response.data.reports)
        console.log(`✅ Loaded ${response.data.reports.length} saved reports`)
      }
    } catch (error) {
      console.error('❌ Failed to load saved reports:', error)
    }
  }

  // Delete a saved report
  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return

    try {
      await axios.delete(`${API_URL}/api/reports/${reportId}?email=${encodeURIComponent(userEmail)}`)
      setSavedReports(savedReports.filter(r => r.id !== reportId))
      console.log('✅ Report deleted')
    } catch (error) {
      console.error('❌ Failed to delete report:', error)
      alert('Failed to delete report')
    }
  }

  // Generate a new report using the new service
  const generateNewReport = async (reportType: 'dashboard' | 'competitor' | 'social' | 'seo' | 'overall') => {
    if (!canGenerateReports) {
      alert(`You've reached your monthly limit of ${maxReports} reports. Upgrade your plan for more reports.`)
      return
    }

    if (!userEmail) {
      alert('Please log in to generate reports')
      return
    }

    setIsGenerating(true)
    setGeneratingType(reportType)

    try {
      // Calculate period (last 30 days)
      const periodEnd = new Date().toISOString()
      const periodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      console.log(`📊 Generating ${reportType} report...`)

      const response = await axios.post(`${API_URL}/api/reports/generate`, {
        email: userEmail,
        reportType,
        periodStart,
        periodEnd
      })

      if (response.data.success) {
        console.log('✅ Report generated successfully')
        incrementUsage('reportsThisMonth')
        
        // Reload saved reports
        await loadSavedReports(userEmail)
        
        alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`)
      }
    } catch (err) {
      console.error('❌ Failed to generate report:', err)
      const error = err as any
      alert(`Failed to generate report: ${error.response?.data?.error || error.message}`)
    } finally {
      setIsGenerating(false)
      setGeneratingType(null)
    }
  }

  const generateReport = async (reportType: string) => {
    if (!canGenerateReports) {
      alert(`You've reached your monthly limit of ${maxReports} reports. Upgrade your plan for more reports.`)
      return
    }

    setIsGenerating(true)
    setGeneratingType(reportType)

    try {
      let endpoint = ''
      let requestData: any = {
        email: userEmail, // Get from auth context
        domain: userDomain || 'example.com' // Get from user settings with fallback
      }

      // Determine endpoint based on report type
      switch (reportType) {
        case 'SEO & Website Performance':
          endpoint = '/api/reports/seo-performance'
          break
        case 'Competitor Intelligence':
          endpoint = '/api/reports/competitor-intelligence'
          requestData.yourDomain = 'example.com'
          requestData.competitorDomain = 'competitor.com'
          break
        case 'Social Media Performance':
          endpoint = '/api/reports/social-media'
          requestData.platform = 'facebook'
          requestData.timeframe = '30d'
          break
        case 'Comprehensive Business':
          endpoint = '/api/reports/comprehensive'
          requestData.competitorDomain = 'competitor.com'
          break
        default:
          throw new Error('Unknown report type')
      }

      console.log('Generating report:', reportType)
      console.log('Endpoint:', `${API_URL}${endpoint}`)
      console.log('Request data:', requestData)

      // Generate PDF
      const response = await axios.post(`${API_URL}${endpoint}`, requestData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout
      })

      console.log('Response received, size:', response.data.size)

      // Check if response is actually a PDF
      if (response.data.type !== 'application/pdf' && response.data.size < 1000) {
        // Might be an error response
        const text = await response.data.text()
        console.error('Error response:', text)
        throw new Error('Invalid PDF response from server')
      }

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const filename = `${reportType.toLowerCase().replace(/\s+/g, '-')}-report-${Date.now()}.pdf`
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)

      // Report already saved to database via the generate endpoint
      incrementUsage('reportsThisMonth')

      console.log('Report generated successfully:', filename)
      alert('Report generated and downloaded successfully!')
    } catch (error: any) {
      console.error('Error generating report:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      let errorMessage = 'Failed to generate report. '
      if (error.response?.status === 400) {
        errorMessage += 'Invalid request data.'
      } else if (error.response?.status === 404) {
        errorMessage += 'No data available. Please run an analysis first.'
      } else if (error.response?.status === 500) {
        errorMessage += 'Server error. Please try again later.'
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timeout. The report is taking too long to generate.'
      } else {
        errorMessage += error.message || 'Please try again.'
      }
      
      alert(errorMessage)
    } finally {
      setIsGenerating(false)
      setGeneratingType(null)
    }
  }

  const downloadReport = (report: any) => {
    if (report.blob) {
      const url = window.URL.createObjectURL(report.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${report.type.toLowerCase().replace(/\s+/g, '-')}-report-${report.date}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  }

  const reportTypes = [
    {
      name: 'SEO & Website Performance',
      description: 'Complete SEO analysis including Lighthouse scores, Core Web Vitals, technical SEO, and performance metrics',
      icon: <Globe className="w-5 h-5" />,
      features: ['Lighthouse Scores', 'Core Web Vitals', 'Technical SEO', 'Page Speed Analysis', 'Mobile Performance', 'SEO Recommendations'],
      color: 'bg-blue-500'
    },
    {
      name: 'Competitor Intelligence',
      description: 'In-depth competitor analysis comparing your performance against competitors across all metrics',
      icon: <Target className="w-5 h-5" />,
      features: ['Performance Comparison', 'SEO Analysis', 'Technology Stack', 'Traffic Analysis', 'Backlinks', 'Content Strategy'],
      color: 'bg-purple-500'
    },
    {
      name: 'Social Media Performance',
      description: 'Comprehensive social media analytics covering Facebook, LinkedIn, and Instagram performance',
      icon: <Users className="w-5 h-5" />,
      features: ['Engagement Metrics', 'Follower Growth', 'Post Performance', 'Audience Insights', 'Best Times to Post', 'Content Recommendations'],
      color: 'bg-pink-500'
    },
    {
      name: 'Comprehensive Business',
      description: 'All-in-one report combining SEO, competitor intelligence, and social media performance',
      icon: <BarChart3 className="w-5 h-5" />,
      features: ['Complete SEO Analysis', 'Competitor Benchmarking', 'Social Media Analytics', 'Traffic Insights', 'Growth Opportunities', 'Action Plan'],
      color: 'bg-green-500'
    }
  ]

  return (
    <DashboardLayout user={null}>
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              Generate comprehensive PDF reports for all your business metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={canGenerateReports ? "default" : "destructive"} className="px-3 py-1">
              {remainingReports} reports remaining
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {plan.toUpperCase()} Plan
            </Badge>
          </div>
        </div>

        {/* Usage Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Reports Generated</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{currentUsage}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Reports Remaining</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{remainingReports}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Monthly Limit</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{maxReports}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Reports */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((reportType, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`${reportType.color} p-3 rounded-xl text-white flex-shrink-0`}>
                      {reportType.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{reportType.name}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {reportType.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {reportType.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => generateReport(reportType.name)}
                    disabled={!canGenerateReports || (isGenerating && generatingType === reportType.name)}
                    className={`w-full ${reportType.color} hover:opacity-90 text-white border-0`}
                  >
                    {isGenerating && generatingType === reportType.name ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-pulse" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Generate PDF Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Reports</CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1">
                  Download and manage your generated reports
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loadingReports ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Loading saved reports...</p>
              </div>
            ) : savedReports.length > 0 ? (
              <div className="space-y-3">
                {savedReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{report.report_title}</div>
                        <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {report.report_type}
                          </Badge>
                          <Clock className="w-3 h-3" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={
                          report.status === 'generated' 
                            ? 'text-green-600 border-green-200 bg-green-50'
                            : 'text-yellow-600 border-yellow-200 bg-yellow-50'
                        }
                      >
                        {report.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => deleteReport(report.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-base font-medium text-gray-900">No reports generated yet</p>
                <p className="text-sm text-gray-500 mt-1">Generate your first report using the options above</p>
              </div>
            )}
          </CardContent>
        </Card>

          {/* Upgrade Prompt */}
          {!canGenerateReports && (
            <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-red-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 mb-1">Report Limit Reached</h3>
                    <p className="text-sm text-orange-700 mb-4">
                      You&apos;ve used all {maxReports} reports for this month. Upgrade to Pro for 20 reports or Enterprise for unlimited reports.
                    </p>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

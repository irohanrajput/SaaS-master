'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Mail, 
  Phone, 
  Calendar,
  BarChart3,
  PieChart,
  Filter,
  Download,
  Plus,
  Eye,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign
} from 'lucide-react'
import { useSubscription, usePlanCheck } from '@/contexts/SubscriptionContext'

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed-won' | 'closed-lost'
  value: number
  created_at: string
  last_activity: string
  score: number
}

interface LeadMetrics {
  total_leads: number
  qualified_leads: number
  conversion_rate: number
  avg_deal_value: number
  pipeline_value: number
  monthly_growth: number
}

interface LeadsDashboardProps {
  userEmail: string
}

export default function LeadsDashboard({ userEmail }: LeadsDashboardProps) {
  const { plan, updateUsage } = useSubscription()
  const { canAccess, limitMessage } = usePlanCheck('leads')
  const [leads, setLeads] = useState<Lead[]>([])
  const [metrics, setMetrics] = useState<LeadMetrics>({
    total_leads: 0,
    qualified_leads: 0,
    conversion_rate: 0,
    avg_deal_value: 0,
    pipeline_value: 0,
    monthly_growth: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSource, setSelectedSource] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    fetchLeadsData()
  }, [userEmail])

  const fetchLeadsData = async () => {
    if (!canAccess) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Simulate API call - replace with actual backend integration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data for demonstration
      const mockLeads: Lead[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john@techstartup.com',
          phone: '+1-555-0123',
          company: 'Tech Startup Inc',
          source: 'Website',
          status: 'qualified',
          value: 5000,
          created_at: '2024-11-01',
          last_activity: '2024-11-03',
          score: 85
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@digitalagency.com',
          phone: '+1-555-0124',
          company: 'Digital Agency Co',
          source: 'LinkedIn',
          status: 'proposal',
          value: 8500,
          created_at: '2024-10-28',
          last_activity: '2024-11-02',
          score: 92
        },
        {
          id: '3',
          name: 'Mike Chen',
          email: 'mike@ecommerce.com',
          company: 'E-commerce Solutions',
          source: 'Referral',
          status: 'new',
          value: 3200,
          created_at: '2024-11-02',
          last_activity: '2024-11-02',
          score: 67
        },
        {
          id: '4',
          name: 'Emily Davis',
          email: 'emily@consultingfirm.com',
          phone: '+1-555-0126',
          company: 'Consulting Firm LLC',
          source: 'Google Ads',
          status: 'contacted',
          value: 12000,
          created_at: '2024-10-30',
          last_activity: '2024-11-01',
          score: 78
        },
        {
          id: '5',
          name: 'Robert Wilson',
          email: 'robert@healthcare.com',
          company: 'Healthcare Group',
          source: 'Website',
          status: 'closed-won',
          value: 15000,
          created_at: '2024-10-15',
          last_activity: '2024-10-25',
          score: 95
        }
      ]

      const mockMetrics: LeadMetrics = {
        total_leads: mockLeads.length,
        qualified_leads: mockLeads.filter(l => l.status === 'qualified' || l.status === 'proposal').length,
        conversion_rate: 23.5,
        avg_deal_value: 8740,
        pipeline_value: mockLeads.reduce((sum, lead) => sum + lead.value, 0),
        monthly_growth: 15.2
      }

      setLeads(mockLeads)
      setMetrics(mockMetrics)
      
      // Update usage tracking
      updateUsage('aiInsightsThisMonth', mockLeads.length)
      
    } catch (error) {
      console.error('Error fetching leads data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-purple-100 text-purple-800',
      'proposal': 'bg-orange-100 text-orange-800',
      'closed-won': 'bg-green-100 text-green-800',
      'closed-lost': 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      'new': <Plus className="w-4 h-4" />,
      'contacted': <Phone className="w-4 h-4" />,
      'qualified': <CheckCircle className="w-4 h-4" />,
      'proposal': <Eye className="w-4 h-4" />,
      'closed-won': <CheckCircle className="w-4 h-4" />,
      'closed-lost': <AlertCircle className="w-4 h-4" />
    }
    return icons[status as keyof typeof icons] || <Clock className="w-4 h-4" />
  }

  const filteredLeads = leads.filter(lead => {
    const sourceMatch = selectedSource === 'all' || lead.source.toLowerCase() === selectedSource.toLowerCase()
    const statusMatch = selectedStatus === 'all' || lead.status === selectedStatus
    return sourceMatch && statusMatch
  })

  if (!canAccess) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Funnel Diagnostics</h1>
            <p className="text-gray-600 mt-1">Track and optimize your lead generation performance</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upgrade Required</h3>
            <p className="text-gray-600 text-center mb-4">{limitMessage}</p>
            <Button>Upgrade Now</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Funnel Diagnostics</h1>
          <p className="text-gray-600 mt-1">Track and optimize your lead generation performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchLeadsData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.total_leads}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+{metrics.monthly_growth}% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.qualified_leads}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={(metrics.qualified_leads / metrics.total_leads) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.conversion_rate}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">Above industry average</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.pipeline_value.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm text-gray-600">Avg. Deal: ${metrics.avg_deal_value.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">All Leads</TabsTrigger>
          <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Pipeline</CardTitle>
                <CardDescription>Current leads by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['new', 'contacted', 'qualified', 'proposal', 'closed-won'].map(status => {
                    const count = leads.filter(l => l.status === status).length
                    const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className="font-medium capitalize">{status.replace('-', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24">
                            <Progress value={percentage} className="h-2" />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest lead interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.slice(0, 5).map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-gray-600">{lead.company}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status.replace('-', ' ')}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{lead.last_activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="source-filter">Source:</Label>
                  <select
                    id="source-filter"
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="border rounded-md px-3 py-1 text-sm"
                  >
                    <option value="all">All Sources</option>
                    <option value="website">Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="google ads">Google Ads</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="status-filter">Status:</Label>
                  <select
                    id="status-filter"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border rounded-md px-3 py-1 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="closed-won">Closed Won</option>
                    <option value="closed-lost">Closed Lost</option>
                  </select>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Company</th>
                      <th className="text-left py-3 px-4 font-medium">Source</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Value</th>
                      <th className="text-left py-3 px-4 font-medium">Score</th>
                      <th className="text-left py-3 px-4 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <tr key={lead.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-sm text-gray-600">{lead.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{lead.company}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{lead.source}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status.replace('-', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">${lead.value.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress value={lead.score} className="w-16 h-2" />
                            <span className="text-sm">{lead.score}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{lead.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Lead progression through your sales funnel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { stage: 'Visitors', count: 1000, conversion: 100 },
                  { stage: 'Leads', count: 50, conversion: 5 },
                  { stage: 'Qualified', count: 15, conversion: 1.5 },
                  { stage: 'Proposals', count: 8, conversion: 0.8 },
                  { stage: 'Customers', count: 3, conversion: 0.3 }
                ].map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium">{stage.stage}</h3>
                          <p className="text-sm text-gray-600">{stage.conversion}% conversion</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{stage.count}</p>
                        <p className="text-sm text-gray-600">people</p>
                      </div>
                    </div>
                    {index < 4 && (
                      <div className="flex justify-center mt-2 mb-2">
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Where your leads are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { source: 'Website', count: 15, percentage: 60, color: 'bg-blue-500' },
                    { source: 'LinkedIn', count: 5, percentage: 20, color: 'bg-purple-500' },
                    { source: 'Google Ads', count: 3, percentage: 12, color: 'bg-green-500' },
                    { source: 'Referral', count: 2, percentage: 8, color: 'bg-orange-500' }
                  ].map(source => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${source.color}`} />
                        <span className="font-medium">{source.source}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <Progress value={source.percentage} className="h-2" />
                        </div>
                        <span className="text-sm font-medium w-8">{source.count}</span>
                        <span className="text-sm text-gray-600 w-12">{source.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance by Source</CardTitle>
                <CardDescription>Conversion rates and quality metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { source: 'Referral', conversion: 45, avgValue: 12500, quality: 'High' },
                    { source: 'LinkedIn', conversion: 35, avgValue: 8500, quality: 'High' },
                    { source: 'Website', conversion: 25, avgValue: 6200, quality: 'Medium' },
                    { source: 'Google Ads', conversion: 15, avgValue: 4800, quality: 'Medium' }
                  ].map(source => (
                    <div key={source.source} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{source.source}</span>
                        <Badge variant={source.quality === 'High' ? 'default' : 'secondary'}>
                          {source.quality}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Conversion</p>
                          <p className="font-medium">{source.conversion}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg. Value</p>
                          <p className="font-medium">${source.avgValue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
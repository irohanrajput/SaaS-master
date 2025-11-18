import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Building2 } from 'lucide-react'
import Link from 'next/link'

export default async function SettingsPage() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    
    if (error || !data?.user) {
      redirect('/login')
    }

    return (
      <DashboardLayout user={data.user}>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">
                Manage your account and business settings
              </p>
            </div>
            
            {/* Business Settings Redirect Card */}
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  Business Settings
                </CardTitle>
                <CardDescription>
                  Business information and competitor tracking has moved to the Competitor Intelligence page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  All business setup, competitor management, and analysis features are now unified in one place for a better experience.
                </p>
                <Link href="/dashboard/competitor-intelligence">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Go to Competitor Intelligence
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Other Settings Sections Can Be Added Here */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-gray-600 mt-1">{data.user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">User ID</label>
                    <p className="text-sm text-gray-600 mt-1 font-mono">{data.user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Settings page error:', error)
    redirect('/login')
  }
}

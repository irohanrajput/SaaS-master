import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LeadsDashboard from '@/components/dashboard/LeadsDashboard'

export default async function LeadsPage() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout user={user}>
      <LeadsDashboard userEmail={user.email || ''} />
    </DashboardLayout>
  )
}
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardContent from '@/components/DashboardContent'

export default async function Dashboard() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    return (
        <DashboardLayout user={data.user}>
            <DashboardContent userEmail={data.user.email} />
        </DashboardLayout>
    )
}
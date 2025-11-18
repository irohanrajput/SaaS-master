import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardPageLayout from '@/components/DashboardPageLayout'
import CompetitorIntelligence from '@/components/CompetitorIntelligence'

export default async function CompetitorPage() {
    try {
        const supabase = createClient()

        const { data, error } = await supabase.auth.getUser()
        
        if (error) {
            console.error('Supabase auth error:', error)
            redirect('/login')
        }
        
        if (!data?.user) {
            redirect('/login')
        }

        return (
            <DashboardPageLayout user={data.user}>
                <main className="flex-1 overflow-auto p-6">
                    <CompetitorIntelligence />
                </main>
            </DashboardPageLayout>
        )
    } catch (error) {
        console.error('Competitor page error:', error)
        redirect('/login')
    }
}

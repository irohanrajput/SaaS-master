"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SidebarAIRecommendations({ collapsed }: { collapsed: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recs, setRecs] = useState<string[]>([])

  useEffect(() => {
    // lazy-load small preview when component mounts
    let mounted = true
    const fetchPreview = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/competitor/ai-recommendations?preview=true')
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const json = await res.json()
        if (mounted) setRecs((json.recommendations || []).slice(0, 3))
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchPreview()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="p-3 border-t border-gray-100">
      {!collapsed ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">AI Recommendations</h4>
            <a href="/dashboard/ai-insights" className="text-xs text-primary hover:underline">
              View all
            </a>
          </div>

          {loading && <p className="text-xs text-gray-500">Loading recommendations…</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}

          {!loading && !error && recs.length === 0 && (
            <p className="text-xs text-gray-500">No recommendations available</p>
          )}

          <ul className="space-y-1">
            {recs.map((r, i) => (
              <li key={i} className="text-xs text-gray-700">
                • {r}
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <Button asChild size="sm">
              <a href="/dashboard/ai-insights">Open AI Hub</a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <a href="/dashboard/ai-insights" title="AI Recommendations">
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 22v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}

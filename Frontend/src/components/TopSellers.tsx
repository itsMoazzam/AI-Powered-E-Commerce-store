import { useEffect, useState } from 'react'
import api from '../lib/api'
import ReportModal from './ReportModal'

export default function TopSellers() {
  const [sellers, setSellers] = useState<any[]>([])
  const [reportOpen, setReportOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState<{ id: number | string; name?: string } | null>(null)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const { data } = await api.get('/api/seller/top/')
          if (!mounted) return
          setSellers(Array.isArray(data) ? data : [])
        } catch (err) {
          console.warn('Top sellers endpoint failed, using demo data', err)
          // fallback static demo
          setSellers([{ id: 1, name: 'Demo Seller', score: 123, business_name: 'Demo Store' }])
        }
      })()
    return () => { mounted = false }
  }, [])

  const openReport = (s: any) => {
    setReportTarget({ id: s.id, name: s.business_name || s.name || s.username })
    setReportOpen(true)
  }

  const displayName = (s: any) => s.full_name ?? (s.first_name && s.last_name ? `${s.first_name} ${s.last_name}` : null) ?? s.name ?? s.username ?? `Seller ${s.id}`

  return (
    <section className="bg-surface border-theme border p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Top Sellers</h3>
      <ol className="list-decimal pl-5 text-sm space-y-2">
        {sellers.map((s, idx) => (
          <li key={s.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{displayName(s)}</div>
              {s.business_name && <div className="text-xs text-muted">{s.business_name}</div>}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-muted">{s.score ?? s.sales ?? '-'}</div>
              <button onClick={() => openReport(s)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 border border-red-100 hover:bg-red-100">Report</button>
            </div>
          </li>
        ))}
      </ol>

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="seller"
        targetId={reportTarget?.id ?? 0}
        targetName={reportTarget?.name}
      />
    </section>
  )
}

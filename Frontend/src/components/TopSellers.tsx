import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

export default function TopSellers() {
  const [sellers, setSellers] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const { data } = await api.get('/api/seller/top/')
          if (!mounted) return

          // support multiple response shapes: array | { results: [] } | { sellers: [] }
          const rawList = Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
              ? data.results
              : Array.isArray(data?.sellers)
                ? data.sellers
                : []

          console.debug('TopSellers API response shape:', data)

          const normalizeSeller = (raw: any) => {
            const s = raw?.seller ?? raw?.user ?? raw
            const id = raw?.id ?? s?.id

            const score = raw?.score ?? raw?.sales ?? s?.score ?? s?.sales ?? null

            const displayName =
              s?.user?.profile?.full_name ?? s?.user?.full_name ?? s?.full_name ??
              (s?.first_name && s?.last_name ? `${s.first_name} ${s.last_name}` : null) ??
              s?.name ?? s?.username ?? null

            const businessName = raw?.business_name ?? s?.business_name ?? s?.store_name ?? s?.shop_name ?? null

            return { ...raw, id, score, displayName, businessName }
          }

          setSellers(rawList.map(normalizeSeller))
        } catch (err) {
          console.warn('Top sellers endpoint failed, using demo data', err)
          // fallback static demo
          setSellers([{ id: 1, name: 'Demo Seller', score: 123, business_name: 'Demo Store', displayName: 'Demo Seller', businessName: 'Demo Store' }])
        }
      })()
    return () => { mounted = false }
  }, [])

  const openReport = (s: any) => {
    const name = s.business_name || s.store_name || s.shop_name || s.name || s.username || ''
    navigate(`/report?type=seller&targetId=${s.id}&targetName=${encodeURIComponent(name)}`)
  }

  const displayName = (s: any) => s.displayName ?? s.user?.profile?.full_name ?? s.user?.full_name ?? s.full_name ?? (s.first_name && s.last_name ? `${s.first_name} ${s.last_name}` : null) ?? s.name ?? s.username ?? `Seller ${s.id}`

  const businessName = (s: any) => s.businessName ?? s.business_name ?? s.store_name ?? s.shop_name ?? null

  return (
    <section className="bg-surface border-theme border p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Top Sellers</h3>
      <ol className="list-decimal pl-5 text-sm space-y-2">
        {sellers.map((s, idx) => (
          <li key={s.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{displayName(s)}</div>
              {businessName(s) && <div className="text-xs text-muted">{businessName(s)}</div>}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-muted">{s.score ?? s.sales ?? '-'}</div>
              <button onClick={() => openReport(s)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 border border-red-100 hover:bg-red-100">Report</button>
            </div>
          </li>
        ))}
      </ol>

    </section>
  )
}

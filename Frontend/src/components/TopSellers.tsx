import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function TopSellers() {
  const [sellers, setSellers] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await api.get('/api/sellers/top10/')
        if (!mounted) return
        setSellers(Array.isArray(data) ? data : [])
      } catch (err) {
        console.warn('Top sellers endpoint failed, using demo data', err)
        // fallback static demo
        setSellers([{ id: 1, name: 'Demo Seller', score: 123 }])
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <section className="bg-surface border-theme border p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Top Sellers</h3>
      <ol className="list-decimal pl-5 text-sm space-y-2">
        {sellers.map((s, idx) => (
          <li key={s.id} className="flex items-center justify-between">
            <div>{s.name || s.username || `Seller ${s.id}`}</div>
            <div className="text-sm text-muted">{s.score ?? s.sales ?? '-'}</div>
          </li>
        ))}
      </ol>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import api from '../../../lib/api'

type Order = {
  id: number | string
  status: string
  customer?: string
  total?: number
  updated_at?: string
  location?: { lat: number; lng: number }
}

type Period = 'week' | 'month' | 'year' | 'custom'

function startEndFor(period: Period, customStart?: string, customEnd?: string) {
  const now = new Date()
  let start = new Date(now)
  let end = new Date(now)

  if (period === 'week') {
    // start at 7 days ago
    start.setDate(now.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  } else if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    end.setHours(23, 59, 59, 999)
  } else if (period === 'year') {
    start = new Date(now.getFullYear(), 0, 1)
    end = new Date(now.getFullYear(), 11, 31)
    end.setHours(23, 59, 59, 999)
  } else if (period === 'custom' && customStart && customEnd) {
    start = new Date(customStart)
    start.setHours(0, 0, 0, 0)
    end = new Date(customEnd)
    end.setHours(23, 59, 59, 999)
  }

  return { start: start.toISOString(), end: end.toISOString() }
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('week')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [customStart, setCustomStart] = useState<string>('')
  const [customEnd, setCustomEnd] = useState<string>('')

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<number | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const { start, end } = startEndFor(period, customStart, customEnd)
      const params: Record<string, string> = { start, end }
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter
      const { data } = await api.get('/api/seller/orders/', { params })
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load orders', err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    fetchOrders()

    // websocket for live updates (keep previous behavior)
    function connect() {
      try {
        const base = import.meta.env.VITE_WS_URL || window.location.origin.replace(/^http/, 'ws')
        const url = base + '/ws/seller/orders/'
        const ws = new WebSocket(url)
        wsRef.current = ws

        ws.onopen = () => {
          console.info('Orders WS open')
        }

        ws.onmessage = (ev) => {
          try {
            const payload = JSON.parse(ev.data)
            if (payload?.type === 'order_update' && payload.order) {
              setOrders((prev) => {
                const found = prev.find((o) => o.id === payload.order.id)
                if (found) {
                  return prev.map((o) => (o.id === payload.order.id ? { ...o, ...payload.order } : o))
                }
                return [payload.order, ...prev]
              })
            }
          } catch (err) {
            console.error('Bad WS message', err)
          }
        }

        ws.onclose = () => {
          console.warn('Orders WS closed — will reconnect')
          if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current)
          reconnectTimer.current = window.setTimeout(connect, 3000)
        }

        ws.onerror = (e) => {
          console.error('Orders WS error', e)
          ws.close()
        }
      } catch (err) {
        console.error('WS connect failed', err)
        if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current)
        reconnectTimer.current = window.setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      mounted = false
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current)
      try { wsRef.current?.close() } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // refetch whenever period/status/custom range changes
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, statusFilter])

  // compute summary counts
  const counts = orders.reduce(
    (acc, o) => {
      const s = (o.status || 'unknown').toLowerCase()
      if (s.includes('cancel')) acc.cancelled++
      else if (s.includes('fail') || s.includes('error')) acc.failed++
      else acc.success++
      return acc
    },
    { success: 0, cancelled: 0, failed: 0 }
  )

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Orders</h2>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-4 gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setPeriod('week')} className={`px-3 py-1 rounded ${period === 'week' ? 'btn-primary' : 'btn-outline'}`}>Week</button>
          <button onClick={() => setPeriod('month')} className={`px-3 py-1 rounded ${period === 'month' ? 'btn-primary' : 'btn-outline'}`}>Month</button>
          <button onClick={() => setPeriod('year')} className={`px-3 py-1 rounded ${period === 'year' ? 'btn-primary' : 'btn-outline'}`}>Year</button>
          <button onClick={() => setPeriod('custom')} className={`px-3 py-1 rounded ${period === 'custom' ? 'btn-primary' : 'btn-outline'}`}>Custom</button>
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <label className="text-sm">From</label>
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="border px-2 py-1 rounded" />
            <label className="text-sm">To</label>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="border px-2 py-1 rounded" />
            <button onClick={() => fetchOrders()} className="btn-primary px-3 py-1 rounded">Apply</button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border px-2 py-1 rounded">
            <option value="all">All</option>
            <option value="successful">Successful</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
          <button onClick={() => fetchOrders()} className="btn-outline px-3 py-1 rounded">Refresh</button>
        </div>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="p-3 bg-surface rounded shadow-sm">
          <div className="text-sm text-muted">Successful</div>
          <div className="text-lg font-semibold">{counts.success}</div>
        </div>
        <div className="p-3 bg-surface rounded shadow-sm">
          <div className="text-sm text-muted">Cancelled</div>
          <div className="text-lg font-semibold">{counts.cancelled}</div>
        </div>
        <div className="p-3 bg-surface rounded shadow-sm">
          <div className="text-sm text-muted">Failed</div>
          <div className="text-lg font-semibold">{counts.failed}</div>
        </div>
      </div>

      <div className="space-y-3">
        {loading && <div className="text-sm text-muted">Loading orders…</div>}
        {error && <div className="text-sm text-danger">{error}</div>}
        {!loading && orders.length === 0 && <div className="text-sm text-muted">No orders for the selected range</div>}

        {orders.map((o) => (
          <div key={o.id} className="p-4 border-theme border rounded-md bg-surface">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Order #{o.id}</div>
                <div className="text-sm text-muted">{o.customer || 'Customer'}</div>
              </div>
              <div className="text-sm text-right">
                <div>Status: <span className="font-medium">{o.status}</span></div>
                <div className="text-xs text-muted">{o.updated_at}</div>
                {typeof o.total === 'number' && <div className="text-sm font-medium">${o.total.toFixed(2)}</div>}
              </div>
            </div>
            {o.location && (
              <div className="mt-3 text-sm text-muted">Location: {o.location.lat.toFixed(4)},{o.location.lng.toFixed(4)}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

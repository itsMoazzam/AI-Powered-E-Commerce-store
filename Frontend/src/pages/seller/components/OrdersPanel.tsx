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

  // normalize an incoming order shape into the UI Order
  const normalizeOrder = (item: any): Order => ({
    id: item.id,
    status: item.status,
    // prefer customer profile full name, fall back to other name fields
    customer:
      item.customer?.profile?.full_name ??
      item.customer?.full_name ??
      item.customer?.name ??
      item.customer_name ??
      item.buyer?.profile?.full_name ??
      item.buyer?.full_name ??
      item.buyer_name ??
      item.user?.profile?.full_name ??
      item.user?.name ??
      item.shipping?.name ??
      undefined,
    total:
      typeof item.final_total === 'string'
        ? parseFloat(item.final_total)
        : typeof item.final_total === 'number'
          ? item.final_total
          : typeof item.total === 'string'
            ? parseFloat(item.total)
            : typeof item.total === 'number'
              ? item.total
              : undefined,
    updated_at: item.updated_at ?? item.updated ?? item.created ?? undefined,
    location: item.location
  })

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const { start, end } = startEndFor(period, customStart, customEnd)
      const params: Record<string, string> = { start, end }
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter

      const resp = await api.get('/api/seller/orders/', { params })
      const data = resp.data

      console.debug('Orders API response shape:', data)

      const rawList = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
          ? data.orders
          : Array.isArray(data.results)
            ? data.results
            : []

      const list = rawList.map((item: any) => normalizeOrder(item))

      setOrders(list)
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
          console.debug('Orders WS message:', ev.data)
          try {
            const payload = JSON.parse(ev.data)
            const type = (payload.type || '').toLowerCase()
            const order = payload.order || payload.data?.order || payload

            if (type.includes('order') && (type.includes('create') || type.includes('created'))) {
              fetchOrders()
              return
            }

            if (order) {
              const normalized = normalizeOrder(order)
              setOrders((prev) => {
                const oid = String(normalized.id)
                const found = prev.find((o) => String(o.id) === oid)
                if (found) {
                  return prev.map((o) => (String(o.id) === oid ? { ...o, ...normalized } : o))
                }
                return [normalized, ...prev]
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
      try { wsRef.current?.close() } catch { }
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

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || ''
    if (s.includes('success') || s.includes('completed')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    if (s.includes('cancel')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    if (s.includes('fail') || s.includes('error')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  }

  const statusIcon = (status: string) => {
    const s = status?.toLowerCase() || ''
    if (s.includes('success') || s.includes('completed')) return '✅'
    if (s.includes('cancel')) return '❌'
    if (s.includes('fail') || s.includes('error')) return '⚠️'
    return '⏳'
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-default">📦 Orders</h2>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          {/* Period Filter */}
          <div className="flex flex-wrap gap-2">
            {['week', 'month', 'year', 'custom'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p as Period)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-sm transition-all"
                style={{
                  background: period === p ? 'var(--color-primary)' : 'var(--bg)',
                  color: period === p ? 'var(--color-primary-text)' : 'var(--text)',
                  border: `1px solid ${period === p ? 'var(--color-primary)' : 'var(--card-border)'}`
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          {period === 'custom' && (
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <label className="text-sm font-medium">From:</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="input-responsive flex-1 min-w-0"
                style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
              />
              <label className="text-sm font-medium">To:</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="input-responsive flex-1 min-w-0"
                style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
              />
              <button
                onClick={() => fetchOrders()}
                className="btn-responsive w-full sm:w-auto mt-2 sm:mt-0"
                style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
              >
                Apply
              </button>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <label className="text-sm font-medium">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-responsive flex-1"
              style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
            >
              <option value="all">All Orders</option>
              <option value="successful">✅ Successful</option>
              <option value="cancelled">❌ Cancelled</option>
              <option value="failed">⚠️ Failed</option>
            </select>
            <button
              onClick={() => fetchOrders()}
              className="btn-responsive w-full sm:w-auto"
              style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--card-border)' }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div className="p-3 sm:p-4 rounded-lg border border-card" style={{ background: 'var(--surface)' }}>
            <div className="text-xs sm:text-sm text-muted">✅ Successful</div>
            <div className="text-lg sm:text-2xl font-bold text-default">{counts.success}</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg border border-card" style={{ background: 'var(--surface)' }}>
            <div className="text-xs sm:text-sm text-muted">❌ Cancelled</div>
            <div className="text-lg sm:text-2xl font-bold text-default">{counts.cancelled}</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg border border-card" style={{ background: 'var(--surface)' }}>
            <div className="text-xs sm:text-sm text-muted">⚠️ Failed</div>
            <div className="text-lg sm:text-2xl font-bold text-default">{counts.failed}</div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {loading && (
            <div className="p-6 text-center text-muted">
              <div className="animate-spin inline-block">⏳</div> Loading orders…
            </div>
          )}
          {error && (
            <div className="p-4 rounded-lg bg-red-100/30 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
              ❌ {error}
            </div>
          )}
          {!loading && orders.length === 0 && (
            <div className="p-6 text-center text-muted rounded-lg border border-card" style={{ background: 'var(--surface)' }}>
              📭 No orders for the selected range
            </div>
          )}

          {orders.map((o) => (
            <div
              key={o.id}
              className="p-3 sm:p-4 rounded-lg border border-card hover:border-blue-400 transition-all"
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Left: Order Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-default">Order #{o.id}</div>
                  <div className="text-xs sm:text-sm text-muted mt-1">👤 {o.customer || 'Customer'}</div>
                </div>

                {/* Middle: Status Badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 ${getStatusColor(o.status || '')}`}>
                    {statusIcon(o.status || '')} {o.status || 'Unknown'}
                  </span>
                </div>

                {/* Right: Amount & Date */}
                <div className="flex flex-col items-end gap-1">
                  {typeof o.total === 'number' && (
                    <div className="text-sm sm:text-base font-bold text-default">
                      ${o.total.toFixed(2)}
                    </div>
                  )}
                  <div className="text-xs text-muted">
                    {o.updated_at ? new Date(o.updated_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Location */}
              {o.location && (
                <div className="mt-3 text-xs text-muted border-t border-card pt-2">
                  📍 {o.location.lat.toFixed(4)}, {o.location.lng.toFixed(4)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

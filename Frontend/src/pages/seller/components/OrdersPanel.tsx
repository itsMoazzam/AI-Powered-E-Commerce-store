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

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await api.get('/api/seller/orders/')
        if (!mounted) return
        setOrders(data || [])
      } catch (err) {
        console.error('Failed to load orders', err)
      }
    })()

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
            // expected shape: { type: 'order_update', order: { id, status, ... } }
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
  }, [])

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Orders</h2>
      <div className="space-y-3">
        {orders.length === 0 && <div className="text-sm text-muted">No recent orders</div>}

        {orders.map((o) => (
          <div key={o.id} className="p-4 border-theme border rounded-md bg-surface">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Order #{o.id}</div>
                <div className="text-sm text-muted">{o.customer || 'Customer'}</div>
              </div>
              <div className="text-sm">
                <div>Status: <span className="font-medium">{o.status}</span></div>
                <div className="text-xs text-muted">{o.updated_at}</div>
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

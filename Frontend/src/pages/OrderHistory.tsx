import { useEffect, useRef, useState } from 'react'
import api from '../lib/api'
import { printInvoice } from '../lib/invoice'
import { loadOrderHistory } from '../lib/checkout'

type Order = {
  id: number | string
  status: string
  total?: number
  created_at?: string
  items?: any[]
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const { data } = await api.get('/api/orders/my/')
          if (!mounted) return
          const backend = Array.isArray(data) ? data : []
          const local = loadOrderHistory() || []
          // Merge local entries (pending or confirmed) before backend list
          setOrders([...local, ...backend])
        } catch (err) {
          console.error('Failed to load orders', err)
          const local = loadOrderHistory() || []
          if (!mounted) return
          setOrders(local)
        }
      })()

    const base = import.meta.env.VITE_WS_URL || window.location.origin.replace(/^http/, 'ws')
    try {
      const ws = new WebSocket(base + '/ws/orders/')
      wsRef.current = ws
      ws.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data)
          if (payload?.type === 'order_update' && payload.order) {
            setOrders((prev) => {
              const found = prev.find((o) => o.id === payload.order.id)
              if (found) return prev.map((o) => (o.id === payload.order.id ? { ...o, ...payload.order } : o))
              return [payload.order, ...prev]
            })
          }
        } catch (err) { console.error(err) }
      }
    } catch (err) {
      console.warn('Order WS failed to connect', err)
    }

    return () => { mounted = false; try { wsRef.current?.close() } catch { } }
  }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Orders</h1>
      <div className="space-y-4">
        {orders.length === 0 && <div className="text-sm text-muted">You have no orders yet.</div>}
        {orders.map((o) => (
          <div key={o.id} className="p-4 bg-surface border-theme border rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Order #{o.id}</div>
                <div className="text-sm text-muted">Placed: {o.created_at}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm">{o.status}</div>
                <button className="btn-outline px-3 py-1 rounded" onClick={() => printInvoice(o)}>Invoice</button>
                {/* Cancel if not paid */}
                {['pending', 'reserved'].includes((o.status || '').toLowerCase()) && (
                  <button className="btn-outline px-3 py-1 rounded" onClick={async () => {
                    if (!confirm('Cancel this order?')) return
                    try {
                      const res = await api.post(`/api/orders/${o.id}/cancel/`)
                      setOrders((prev) => prev.map(p => p.id === o.id ? res.data.order : p))
                      alert('Order cancelled')
                    } catch (err) { console.error(err); alert('Failed to cancel order') }
                  }}>Cancel</button>
                )}

                {/* Confirm received if paid */}
                {String(o.status).toLowerCase() === 'paid' && (
                  <button className="btn-primary px-3 py-1 rounded" onClick={async () => {
                    if (!confirm('Confirm you received the order?')) return
                    try {
                      const res = await api.post(`/api/orders/${o.id}/confirm-received/`)
                      setOrders((prev) => prev.map(p => p.id === o.id ? res.data.order : p))
                      alert('Thank you! Order marked as completed.')
                    } catch (err) { console.error(err); alert('Failed to confirm received') }
                  }}>Confirm Received</button>
                )}
                {/* Feedback */}
                <button className="btn-outline px-3 py-1 rounded" onClick={async () => {
                  const msg = prompt('Leave feedback for this order (optional)')
                  if (msg == null) return
                  try {
                    const res = await api.post(`/api/orders/${o.id}/feedback/`, { message: msg })
                    setOrders((prev) => prev.map(p => p.id === o.id ? res.data.order : p))
                    alert('Feedback saved')
                  } catch (err) { console.error(err); alert('Failed to submit feedback') }
                }}>Feedback</button>
              </div>
            </div>
            {o.items && (
              <div className="mt-3 text-sm text-muted">
                {o.items.map((it: any) => (<div key={it.id}>{it.name} × {it.qty}</div>))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

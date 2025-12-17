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

  const [modal, setModal] = useState<{ type: 'cancel' | 'confirm' | 'feedback' | null, orderId?: number | string } | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const processingIds = useRef(new Set<number | string>())
  const [message, setMessage] = useState<string | null>(null)
  const msgTimeoutRef = useRef<number | null>(null)

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

    return () => { mounted = false; try { wsRef.current?.close() } catch { } if (msgTimeoutRef.current) { clearTimeout(msgTimeoutRef.current); msgTimeoutRef.current = null } }
  }, [])

  const showMessage = (msg: string) => {
    setMessage(msg)
    if (msgTimeoutRef.current) {
      clearTimeout(msgTimeoutRef.current)
      msgTimeoutRef.current = null
    }
    msgTimeoutRef.current = window.setTimeout(() => {
      setMessage(null)
      msgTimeoutRef.current = null
    }, 4000)
  }

  const doCancel = async (id: number | string) => {
    if (processingIds.current.has(id)) return
    processingIds.current.add(id)
    try {
      const res = await api.post(`/api/orders/${id}/cancel/`)
      setOrders((prev) => prev.map(p => p.id === id ? res.data.order : p))
      showMessage('Order cancelled')
      setModal(null)
    } catch (err) { console.error(err); showMessage('Failed to cancel order') } finally { processingIds.current.delete(id) }
  }

  const doConfirm = async (id: number | string) => {
    if (processingIds.current.has(id)) return
    processingIds.current.add(id)
    try {
      const res = await api.post(`/api/orders/${id}/confirm-received/`)
      setOrders((prev) => prev.map(p => p.id === id ? res.data.order : p))
      showMessage('Thank you! Order marked as completed.')
      // Prompt for feedback after confirming
      setModal({ type: 'feedback', orderId: id })
    } catch (err) { console.error(err); showMessage('Failed to confirm received') } finally { processingIds.current.delete(id) }
  }

  const submitFeedback = async (id: number | string) => {
    if (processingIds.current.has(id)) return
    processingIds.current.add(id)
    try {
      const res = await api.post(`/api/orders/${id}/feedback/`, { message: feedbackText })
      setOrders((prev) => prev.map(p => p.id === id ? res.data.order : p))
      showMessage('Feedback saved')
      setModal(null)
      setFeedbackText('')
    } catch (err) { console.error(err); showMessage('Failed to submit feedback') } finally { processingIds.current.delete(id) }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Orders</h1>
      {message && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{message}</div>}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-md p-6 w-full max-w-md">
            {modal.type === 'cancel' && (
              <>
                <div className="text-lg font-semibold mb-2">Cancel Order</div>
                <div className="text-sm text-muted mb-4">Are you sure you want to cancel this order? This action cannot be undone.</div>
                <div className="flex gap-2 justify-end">
                  <button className="px-3 py-1 rounded border" onClick={() => setModal(null)}>Close</button>
                  <button className="px-3 py-1 rounded btn-outline" onClick={() => modal.orderId && doCancel(modal.orderId)}>Confirm Cancel</button>
                </div>
              </>
            )}
            {modal.type === 'confirm' && (
              <>
                <div className="text-lg font-semibold mb-2">Confirm Receipt</div>
                <div className="text-sm text-muted mb-4">Please confirm you have received your order.</div>
                <div className="flex gap-2 justify-end">
                  <button className="px-3 py-1 rounded border" onClick={() => setModal(null)}>Close</button>
                  <button className="px-3 py-1 rounded btn-primary" onClick={() => modal.orderId && doConfirm(modal.orderId)}>Confirm Received</button>
                </div>
              </>
            )}
            {modal.type === 'feedback' && (
              <>
                <div className="text-lg font-semibold mb-2">Leave Feedback</div>
                <textarea className="w-full p-2 border rounded mb-4" rows={4} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Optional feedback..."></textarea>
                <div className="flex gap-2 justify-end">
                  <button className="px-3 py-1 rounded border" onClick={() => { setModal(null); setFeedbackText('') }}>Cancel</button>
                  <button className="px-3 py-1 rounded btn-outline" onClick={() => modal.orderId && submitFeedback(modal.orderId)}>Submit</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
                  <button className="btn-outline px-3 py-1 rounded" onClick={() => setModal({ type: 'cancel', orderId: o.id })} disabled={processingIds.current.has(o.id)}>Cancel</button>
                )}

                {/* Confirm received if paid */}
                {String(o.status).toLowerCase() === 'paid' && (
                  <button className="btn-primary px-3 py-1 rounded" onClick={() => setModal({ type: 'confirm', orderId: o.id })} disabled={processingIds.current.has(o.id)}>Confirm Received</button>
                )}
                {/* Feedback */}
                <button className="btn-outline px-3 py-1 rounded" onClick={() => setModal({ type: 'feedback', orderId: o.id })} disabled={processingIds.current.has(o.id)}>Feedback</button>
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

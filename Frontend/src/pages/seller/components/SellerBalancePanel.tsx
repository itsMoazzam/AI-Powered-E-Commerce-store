import { useEffect, useState } from "react"
import api from "../../../lib/api"

type BalanceEntry = {
    seller_id: number
    order_id: number
    amount_gross: number
    platform_fee: number
    seller_net: number
    payout_status: string
    scheduled_payout_date: string
}

export default function SellerBalancePanel() {
    const [entries, setEntries] = useState<BalanceEntry[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let mounted = true
        setLoading(true)
        api.get('/api/seller/balances/')
            .then(res => { if (mounted) setEntries(res.data) })
            .catch(err => console.error('Failed to load balances', err))
            .finally(() => { if (mounted) setLoading(false) })
        return () => { mounted = false }
    }, [])

    const pending = entries.filter(e => e.payout_status === 'pending')
    const totalPending = pending.reduce((s, e) => s + (e.seller_net || 0), 0)
    const totalScheduled = entries.reduce((s, e) => s + (e.seller_net || 0), 0)

    return (
        <div className="card p-6 bg-white rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-3">Balance & Payouts</h3>
            <div className="flex gap-4 items-center mb-4">
                <div className="p-3 rounded bg-green-50">
                    <div className="text-sm text-muted">Pending payouts</div>
                    <div className="text-xl font-bold">${(totalPending / 100).toFixed(2)}</div>
                </div>
                <div className="p-3 rounded bg-blue-50">
                    <div className="text-sm text-muted">Total scheduled</div>
                    <div className="text-xl font-bold">${(totalScheduled / 100).toFixed(2)}</div>
                </div>
            </div>

            {loading && <div className="text-sm text-muted">Loading balances…</div>}

            {!loading && entries.length === 0 && <div className="text-sm text-muted">No balance entries yet.</div>}

            <div className="divide-y">
                {entries.map((e, i) => (
                    <div key={i} className="py-3 grid grid-cols-3 gap-4 items-center">
                        <div>Order #{e.order_id}</div>
                        <div className="text-sm text-muted">Net: ${(e.seller_net / 100).toFixed(2)} • Fee: ${(e.platform_fee / 100).toFixed(2)}</div>
                        <div className="text-sm text-muted">Scheduled: {new Date(e.scheduled_payout_date).toLocaleDateString()} • {e.payout_status}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

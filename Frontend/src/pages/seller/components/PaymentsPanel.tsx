
// FILE: src/pages/seller/components/PaymentsPanel.tsx
import { useState } from "react"
import { exportToCSV } from "../utils/export"

interface Payment {
    id: string | number;
    txn_id: string | number;
    bank: string;
    amount: number;
    ocr_summary: string;
    email_match: boolean;
    screenshot: string;
    status: string;
}

interface PaymentsPanelProps {
    payments?: Payment[];
    onAction: (id: Payment['id'], action: 'approve' | 'reject') => void;
}

export default function PaymentsPanel({ payments = [], onAction }: PaymentsPanelProps) {
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const filtered = payments.filter((p: Payment) => (filter === 'all' || p.status === filter) && (String(p.txn_id).toLowerCase().includes(search.toLowerCase()) || String(p.bank).toLowerCase().includes(search.toLowerCase())))

    return (
        <div className="card p-6 bg-white dark:bg-zinc-950 rounded-xl shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Screenshot Verification</h3>
                <div className="flex items-center gap-2">
                    <input className="input" placeholder="Search txn or bank" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <button className="btn-outline" onClick={() => exportToCSV('payments.csv', filtered)}>Export CSV</button>
                </div>
            </div>

            <div className="divide-y">
                {filtered.map((p: Payment) => (
                    <div key={p.id} className="py-3 flex items-start justify-between gap-3">
                        <div>
                            <div className="font-medium">Txn #{p.txn_id} • {p.bank} • ${p.amount}</div>
                            <div className="text-xs text-zinc-500">OCR: {p.ocr_summary}</div>
                            <div className="text-xs text-zinc-500 mt-1">Email match: {p.email_match ? 'Yes' : 'No'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href={p.screenshot} target="_blank" className="btn-outline">Open</a>
                            <button className="btn-primary" onClick={() => onAction(p.id, 'approve')}>Approve</button>
                            <button className="btn-outline" onClick={() => onAction(p.id, 'reject')}>Reject</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

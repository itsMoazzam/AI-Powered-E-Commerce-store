
// FILE: src/pages/seller/components/ReviewsPanel.tsx
import { useMemo, useState } from "react"
import { exportToCSV } from "../utils/export"

type Review = {
    id: string | number;
    user: string;
    product: string;
    text: string;
    flag?: string;
    confidence?: number;
    toxicity: number;
};

interface ReviewsPanelProps {
    reviews?: Review[];
    onModerate: (id: string | number, action: string, reason: string) => void;
}

export default function ReviewsPanel({ reviews = [], onModerate }: ReviewsPanelProps) {
    const [flag, setFlag] = useState('all')
    const [product, setProduct] = useState('all')
    const [minConfidence, setMinConfidence] = useState(0)
    const [search, setSearch] = useState('')

    const filtered = useMemo(() => reviews.filter((r: Review) => {
        if (flag !== 'all' && (r.flag || 'none') !== flag) return false
        if (product !== 'all' && r.product !== product) return false
        if (r.confidence !== undefined && r.confidence < minConfidence) return false
        if (search && !String(r.text).toLowerCase().includes(search.toLowerCase())) return false
        return true
    }), [reviews, flag, product, minConfidence, search])

    return (
        <div className="card p-6 bg-white dark:bg-zinc-950 rounded-xl shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Review Moderation</h3>
                <div className="flex items-center gap-2">
                    <input className="input" placeholder="Search reviews" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <select className="input" value={flag} onChange={(e) => setFlag(e.target.value)}>
                        <option value="all">All Flags</option>
                        <option value="spam">Spam</option>
                        <option value="hate">Hate</option>
                        <option value="none">None</option>
                    </select>
                    <input type="number" className="input w-20" value={minConfidence} onChange={(e) => setMinConfidence(Number(e.target.value))} placeholder="conf %" />
                    <button className="btn-outline" onClick={() => exportToCSV('reviews.csv', filtered)}>Export</button>
                </div>
            </div>

            <ul className="space-y-3">
                {filtered.map((r: Review) => (
                    <li key={r.id} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-medium">{r.user} • {r.product}</div>
                                <div className="text-sm mt-1">{r.text}</div>
                                <div className="text-xs text-zinc-500 mt-1">Toxicity: <span className={`${r.toxicity > 0.6 ? 'text-red-500' : r.toxicity > 0.3 ? 'text-yellow-500' : 'text-green-500'}`}>{Math.round(r.toxicity * 100)}%</span> • Confidence: {Math.round((r.confidence || 0) * 100)}%</div>
                            </div>
                            <div className="flex gap-2">
                                <button className="btn-primary" onClick={() => onModerate(r.id, 'approve', '')}>Approve</button>
                                <button className="btn-outline" onClick={() => onModerate(r.id, 'reject', '')}>Reject</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}






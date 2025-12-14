import React from 'react'
import { Link } from 'react-router-dom'

export default function AdCard({ ad }: { ad: any }) {
    const title = ad?.title || ad?.headline || 'Sponsored'
    const cta = ad?.cta_text || 'Learn More'
    const url = ad?.url || '/'

    return (
        <article className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-white shadow-sm">
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3">
                    <img src={String(ad?.image || ad?.thumbnail || '/placeholder.png')} alt={String(title)} className="w-20 h-20 object-cover rounded-md border" />
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-default">{String(title)}</h4>
                        <p className="text-xs text-muted mt-1">{String(ad?.description || '')}</p>
                    </div>
                </div>
                <div className="mt-3 self-end">
                    <Link to={url} className="text-xs font-medium text-indigo-600 hover:underline">{cta}</Link>
                </div>
            </div>
        </article>
    )
}

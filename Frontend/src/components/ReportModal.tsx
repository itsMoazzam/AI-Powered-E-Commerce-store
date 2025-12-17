import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../lib/api'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import LoginModal from './LoginModal'

interface ReportModalProps {
    isOpen: boolean
    onClose: () => void
    targetType: 'product' | 'seller'
    targetId: number | string
    targetName?: string
}

export default function ReportModal({ isOpen, onClose, targetType, targetId, targetName }: ReportModalProps) {
    const user = useSelector((s: RootState) => s.auth.user)
    const [title, setTitle] = useState('')
    const [details, setDetails] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showLogin, setShowLogin] = useState(false)
    const [success, setSuccess] = useState(false)

    React.useEffect(() => {
        if (!isOpen) {
            setTitle('')
            setDetails('')
            setError(null)
            setLoading(false)
            setSuccess(false)
        }
    }, [isOpen])

    if (!isOpen) return null

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (!user) {
            // prompt login
            setShowLogin(true)
            return
        }

        if (!title && !details) {
            setError('Please include a short title or details for the report')
            return
        }

        setLoading(true)
        try {
            const payload = {
                type: targetType === 'product' ? 'product' : 'seller',
                target_id: targetId,
                title: title || `${targetType} report`,
                details: details || ''
            }

            await api.post('/api/reports/', payload)
            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                onClose()
            }, 1200)
        } catch (err: any) {
            console.error('Report failed', err)
            setError(err?.response?.data?.detail || 'Failed to submit report')
        } finally {
            setLoading(false)
        }
    }

    const modal = (
        <div>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-card p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-default">Report {targetType}</h3>
                            <div className="text-sm text-muted">{targetName ? `${targetName} (#${targetId})` : `ID: ${targetId}`}</div>
                        </div>
                        <button onClick={onClose} className="text-muted">Close</button>
                    </div>

                    <form onSubmit={submit} className="mt-4 space-y-3">
                        <div>
                            <label className="text-sm font-medium">Title (short)</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full input-responsive mt-1" placeholder={`What's wrong with this ${targetType}?`} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Details</label>
                            <textarea value={details} onChange={(e) => setDetails(e.target.value)} className="w-full input-responsive mt-1 h-24" placeholder="Provide more information for the admin (optional)" />
                        </div>

                        {error && <div className="text-sm text-red-600">❌ {error}</div>}
                        {success && <div className="text-sm text-green-600">✅ Report submitted — admins will review it</div>}

                        <div className="flex gap-2 mt-2">
                            <button type="submit" className="btn-primary flex-1" disabled={loading || success}>{loading ? 'Submitting…' : 'Submit Report'}</button>
                            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </div>
    )

    return createPortal(modal, document.body)
}

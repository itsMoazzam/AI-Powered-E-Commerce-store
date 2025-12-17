import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'

export default function ReportForm() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const prefType = searchParams.get('type') as 'seller' | 'product' | null
    const prefTargetId = searchParams.get('targetId') ?? ''
    const prefTargetName = searchParams.get('targetName') ?? ''

    const [step, setStep] = useState<number>(2)
    const [type, setType] = useState<'seller' | 'product' | ''>(prefType ?? '')
    const [targetId, setTargetId] = useState<string>(prefTargetId)
    const [targetName, setTargetName] = useState<string>(prefTargetName)
    const [title, setTitle] = useState('')
    const [details, setDetails] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // If prefType existed, ensure state updated
        if (prefType) setType(prefType as any)
        if (prefTargetId) setTargetId(prefTargetId)
        if (prefTargetName) setTargetName(prefTargetName)
    }, [prefType, prefTargetId, prefTargetName])

    const requireAuth = () => {
        const token = localStorage.getItem('token')
        if (!token) {
            // redirect to login
            navigate('/auth/login')
            return false
        }
        return true
    }

    const submitReport = async () => {
        setError(null)
        if (!type) { setError('Please select a report type'); return }
        if (!targetId) { setError('Missing target id'); return }
        if (!title || !details) { setError('Please provide a short title and details'); return }

        if (!requireAuth()) return

        setSubmitting(true)
        try {
            await api.post('/api/seller/reports/', {
                type,
                target_id: targetId,
                title,
                details,
            })
            alert('✅ Report submitted — thank you for helping keep the marketplace safe.')
            navigate('/')
        } catch (err: any) {
            console.error('Report submit failed', err)
            setError(err?.response?.data?.message || err?.message || 'Failed to submit report')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="text-2xl font-semibold mb-4">Report</h1>



            {step === 2 && (
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm text-muted mb-1">Report type</label>
                        <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full border rounded px-3 py-2">
                            <option value="">Select a type</option>
                            <option value="product">Report product</option>
                            <option value="seller">Report seller</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-muted mb-1">Target ID</label>
                        <input value={targetId} onChange={(e) => setTargetId(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Numeric id" />
                        <div className="text-xs text-muted mt-1">If you came from a product or seller page this should already be filled.</div>
                    </div>

                    <div>
                        <label className="block text-sm text-muted mb-1">Target Name (optional)</label>
                        <input value={targetName} onChange={(e) => setTargetName(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Seller name or product title" />
                    </div>

                    <div>
                        <label className="block text-sm text-muted mb-1">Short title</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="e.g. Listing appears counterfeit" />
                    </div>

                    <div>
                        <label className="block text-sm text-muted mb-1">Details</label>
                        <textarea value={details} onChange={(e) => setDetails(e.target.value)} className="w-full border rounded px-3 py-2 min-h-[160px]" placeholder="Describe what happened, include links or screenshots if possible" />
                    </div>

                    {error && <div className="text-red-600">{error}</div>}

                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={submitReport} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit report'}</button>
                        <button className="px-4 py-2 border rounded" onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                </div>
            )}

        </div>
    )
}

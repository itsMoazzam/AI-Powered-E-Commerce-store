import { useState, useEffect } from 'react'
import api from '../../../lib/api'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { useTheme } from '../../../theme/ThemeProvider'

interface Advertisement {
    id: number
    title: string
    subtitle: string
    cta_text: string
    cta_link: string
    image?: string
    type: 'new_arrivals' | 'custom'
    active: boolean
    created_at?: string
}

export default function AdvertisementPanel() {
    const { primary } = useTheme()
    const [ads, setAds] = useState<Advertisement[]>([])
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState({
        title: '',
        subtitle: '',
        cta_text: 'Learn More',
        cta_link: '/',
        type: 'custom' as 'custom' | 'new_arrivals',
        image: null as File | null,
    })

    const fetchAds = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/api/advertisements/')
            setAds(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Failed to load advertisements:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAds()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title || !form.subtitle) {
            alert('Title and subtitle are required')
            return
        }

        const fd = new FormData()
        fd.append('title', form.title)
        fd.append('subtitle', form.subtitle)
        fd.append('cta_text', form.cta_text)
        fd.append('cta_link', form.cta_link)
        fd.append('type', form.type)
        if (form.image) fd.append('image', form.image)

        try {
            if (editingId) {
                await api.put(`/api/advertisements/${editingId}/`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                alert('✅ Advertisement updated!')
            } else {
                await api.post('/api/advertisements/', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                alert('✅ Advertisement created!')
            }
            setForm({
                title: '',
                subtitle: '',
                cta_text: 'Learn More',
                cta_link: '/',
                type: 'custom',
                image: null,
            })
            setEditingId(null)
            setShowForm(false)
            fetchAds()
        } catch (err) {
            console.error('Failed to save advertisement:', err)
            alert('Failed to save advertisement')
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this advertisement?')) return
        try {
            await api.delete(`/api/advertisements/${id}/`)
            alert('✅ Advertisement deleted!')
            fetchAds()
        } catch (err) {
            console.error('Failed to delete advertisement:', err)
        }
    }

    const handleEdit = (ad: Advertisement) => {
        setEditingId(ad.id)
        setForm({
            title: ad.title,
            subtitle: ad.subtitle,
            cta_text: ad.cta_text,
            cta_link: ad.cta_link,
            type: ad.type,
            image: null,
        })
        setShowForm(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-default">🎯 Manage Advertisements</h2>
                <button
                    onClick={() => {
                        setEditingId(null)
                        setForm({
                            title: '',
                            subtitle: '',
                            cta_text: 'Learn More',
                            cta_link: '/',
                            type: 'custom',
                            image: null,
                        })
                        setShowForm(!showForm)
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition"
                    style={{ background: primary }}
                >
                    <Plus size={18} /> Add Advertisement
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="p-4 sm:p-6 rounded-lg border border-card" style={{ background: 'var(--surface)' }}>
                    <h3 className="text-lg font-semibold mb-4 text-default">
                        {editingId ? 'Edit Advertisement' : 'Create New Advertisement'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Title (e.g., 'New Arrivals')"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="input-responsive"
                                style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Subtitle"
                                value={form.subtitle}
                                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                className="input-responsive"
                                style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Button Text"
                                value={form.cta_text}
                                onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                                className="input-responsive"
                                style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                            />
                            <input
                                type="text"
                                placeholder="Button Link (e.g., /search)"
                                value={form.cta_link}
                                onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                                className="input-responsive"
                                style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-default">Type</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value as 'custom' | 'new_arrivals' })}
                                    className="input-responsive w-full"
                                    style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                                >
                                    <option value="custom">Custom Ad</option>
                                    <option value="new_arrivals">New Arrivals</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-default">Banner Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                                    className="block w-full text-sm"
                                />
                                <p className="text-xs text-muted mt-1">Recommended: 1600x600px</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition"
                                style={{ background: primary }}
                            >
                                {editingId ? 'Update' : 'Create'} Advertisement
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingId(null)
                                }}
                                className="flex-1 px-4 py-2 rounded-lg border font-medium transition"
                                style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Ads List */}
            <div className="space-y-3">
                {loading && (
                    <div className="text-center py-8 text-muted">
                        <div className="animate-spin inline-block">⏳</div> Loading advertisements...
                    </div>
                )}
                {!loading && ads.length === 0 && (
                    <div className="p-6 text-center rounded-lg border border-card" style={{ background: 'var(--surface)' }}>
                        <p className="text-muted">No advertisements yet. Create your first one!</p>
                    </div>
                )}
                {ads.map((ad) => (
                    <div
                        key={ad.id}
                        className="p-4 rounded-lg border border-card hover:border-blue-400 transition-all"
                        style={{ background: 'var(--surface)' }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            {/* Image */}
                            {ad.image && (
                                <div className="w-full sm:w-32 h-24 sm:h-20 rounded overflow-hidden flex-shrink-0">
                                    <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-default">{ad.title}</h3>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${primary}20`, color: primary }}>
                                        {ad.type === 'new_arrivals' ? '🆕 New Arrivals' : '✨ Custom'}
                                    </span>
                                    {ad.active && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                            ✅ Active
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted line-clamp-2">{ad.subtitle}</p>
                                <div className="mt-2 text-xs text-muted">
                                    Button: <span className="font-mono">{ad.cta_text}</span> → <span className="font-mono">{ad.cta_link}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(ad)}
                                    className="flex-1 sm:flex-none px-3 py-2 rounded-lg border transition hover:bg-black/5 dark:hover:bg-white/5 text-sm"
                                    style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(ad.id)}
                                    className="flex-1 sm:flex-none px-3 py-2 rounded-lg text-white text-sm font-medium transition hover:opacity-80"
                                    style={{ background: '#ef4444' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg border border-card text-sm text-muted" style={{ background: 'var(--surface)' }}>
                <p className="font-semibold mb-2 text-default">💡 Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Ads appear on the homepage hero banner</li>
                    <li>If you have fewer than 3 ads, default banners fill the space</li>
                    <li>Max 5 ads will show in rotation</li>
                    <li>Use high-quality images for best results (1600x600px)</li>
                </ul>
            </div>
        </div>
    )
}

import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Link } from 'react-router-dom'

export default function CategoriesStrip() {
    const [cats, setCats] = useState<any[]>([])
    const [hovered, setHovered] = useState<number | 'all' | null>(null)
    const [hoveredChild, setHoveredChild] = useState<number | null>(null)

    useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    const { data } = await api.get('/api/products/categories/')
                    if (!mounted) return
                    setCats(Array.isArray(data) ? data : [])
                } catch (err) {
                    console.warn('Failed to load categories', err)
                    setCats([])
                }
            })()
        return () => { mounted = false }
    }, [])

    if (!cats || cats.length === 0) return null

    return (
        <section className="px-4 md:px-10">
            <div className="max-w-7xl mx-auto relative">
                {/* colorful backing bar */}
                <div className="absolute left-0 right-0 top-3 h-8 bg-gradient-to-r from-pink-100 via-yellow-100 to-indigo-100 rounded-md -z-10" />

                <div className="py-1">
                    {/* container-level leave handler closes all menus */}
                    <div className="flex gap-3 items-center" onMouseLeave={() => { setHovered(null); setHoveredChild(null) }}>
                        {/* Show All area */}
                        <div className="relative" onMouseEnter={() => { setHovered('all'); setHoveredChild(null) }}>
                            <button className="flex-shrink-0 px-4 py-2 text-sm cursor-pointer rounded-full bg-white/90 hover:shadow-md transition">All Categories</button>

                            {hovered === 'all' && (
                                <div className="absolute top-full left-0 mt-2 bg-surface border border-card rounded-md shadow-lg p-3 w-[680px] z-50">
                                    <div className="grid grid-cols-3 gap-3">
                                        {cats.map((cat) => (
                                            <div key={cat.id} className="p-1">
                                                <Link onClick={() => { setHovered(null); setHoveredChild(null) }} to={`/category/${cat.slug || cat.id}`} className="block px-2 py-1 text-sm font-medium hover:bg-black/5 rounded">{cat.name}</Link>
                                                {Array.isArray(cat.children) && cat.children.length > 0 && (
                                                    <div className="mt-1 text-xs space-y-1">
                                                        {cat.children.slice(0, 6).map((ch: any) => (
                                                            <Link key={ch.id} onClick={() => { setHovered(null); setHoveredChild(null) }} to={`/category/${ch.slug || ch.id}`} className="block px-2 py-0.5 hover:bg-black/5 rounded">{ch.name}</Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {cats.map((c) => (
                            <div key={c.id} className="relative" onMouseEnter={() => { setHovered(c.id); setHoveredChild(null) }}>
                                <Link
                                    to={`/category/${c.slug || c.id}`}
                                    onClick={() => { setHovered(null); setHoveredChild(null) }}
                                    className={`flex-shrink-0 px-4 py-2 text-sm rounded-full bg-white/90 hover:shadow-md transition ${hovered === c.id ? 'ring-1 ring-indigo-200' : ''}`}
                                >
                                    {c.name}
                                </Link>

                                {/* arrow indicator under the hovered main category */}
                                {hovered === c.id && (
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1 z-50 pointer-events-none">
                                        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L7 7L13 1" stroke="rgba(15,23,42,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}

                                {/* children dropdown on hover */}
                                {hovered === c.id && Array.isArray(c.children) && c.children.length > 0 && (
                                    <div className="absolute top-full left-0 mt-2 bg-surface border border-card rounded-md shadow-lg p-2 w-64 z-50">
                                        {c.children.map((child: any) => (
                                            <div key={child.id} onMouseEnter={() => setHoveredChild(child.id)} className="group relative">
                                                <Link onClick={() => { setHovered(null); setHoveredChild(null) }} to={`/category/${child.slug || child.id}`} className="block px-3 py-2 text-sm hover:bg-black/5 rounded flex justify-between items-center">
                                                    <span>{child.name}</span>
                                                    {/* right arrow indicator when child hovered or has subchildren */}
                                                    {Array.isArray(child.children) && child.children.length > 0 ? (
                                                        <span className={`ml-2 text-xs transition ${hoveredChild === child.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                                                            ›
                                                        </span>
                                                    ) : null}
                                                </Link>

                                                {/* subchildren */}
                                                {hoveredChild === child.id && Array.isArray(child.children) && child.children.length > 0 && (
                                                    <div className="absolute top-0 left-full ml-2 bg-surface border border-card rounded-md p-2 w-52 z-50">
                                                        {child.children.map((sub: any) => (
                                                            <Link key={sub.id} onClick={() => { setHovered(null); setHoveredChild(null) }} to={`/category/${sub.slug || sub.id}`} className="block px-2 py-1 text-xs hover:bg-black/5 rounded">{sub.name}</Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

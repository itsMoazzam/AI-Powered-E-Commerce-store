// src/components/CategoryNavbar.tsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react"
import { FaCartPlus } from "react-icons/fa6";

// import api from "../lib/api" 

type RawCategory = {
    id: number
    name: string
    slug?: string
    parent?: number | null
    children?: RawCategory[]
}

export default function CategoryNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [expanded, setExpanded] = useState<Record<number, boolean>>({})
    const [categories, setCategories] = useState<RawCategory[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        async function load() {
            setLoading(true)
            try {
                // === PRODUCTION: uncomment to fetch from backend ===
                // const { data } = await api.get("/api/categories/")
                // if (!mounted) return
                // setCategories(data)

                // === DEMO FALLBACK for frontend-only testing ===
                const demo: RawCategory[] = [
                    {
                        id: 1,
                        name: "Men",
                        slug: "men",
                        children: [
                            { id: 11, name: "Clothing", slug: "clothing", children: [{ id: 111, name: "T-Shirts", slug: "t-shirts" }] },
                            { id: 12, name: "Shoes", slug: "shoes" },
                            { id: 13, name: "Accessories", slug: "accessories" },
                        ],
                    },
                    {
                        id: 2,
                        name: "Women",
                        slug: "women",
                        children: [
                            { id: 21, name: "Clothing", slug: "clothing-women" },
                            { id: 22, name: "Handbags", slug: "handbags" },
                        ],
                    },
                    { id: 3, name: "Electronics", slug: "electronics" },
                    { id: 4, name: "Home & Furniture", slug: "home-furniture" },
                    { id: 5, name: "Offers", slug: "offers" },
                ]
                if (mounted) setCategories(demo)
            } catch (err) {
                console.error("Failed to load categories", err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()
        return () => {
            mounted = false
        }
    }, [])

    function toggleExpand(id: number) {
        setExpanded((s) => ({ ...s, [id]: !s[id] }))
    }

    function renderCategory(cat: RawCategory, level = 0) {
        const hasChildren = (cat.children && cat.children.length > 0) || false
        return (
            <div key={cat.id} className={`flex flex-col`}>
                <div
                    className={`flex items-center justify-between gap-4 py-2 px-3 rounded-md transition-colors
            ${level === 0 ? "text-gray-800 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}
            hover:bg-gray-50 dark:hover:bg-zinc-800`}
                >
                    <Link
                        to={`/category/${cat.slug ?? cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                        className="truncate grow"
                        onClick={() => setMobileOpen(false)}
                    >
                        <span className={`font-medium ${level === 0 ? "text-base" : "text-sm"}`}>
                            {cat.name}
                        </span>
                    </Link>

                    {hasChildren && (
                        <button
                            aria-expanded={!!expanded[cat.id]}
                            onClick={() => toggleExpand(cat.id)}
                            className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                            title={expanded[cat.id] ? "Collapse" : "Expand"}
                        >
                            {level === 0 ? (
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform ${expanded[cat.id] ? "rotate-180" : ""}`}
                                />
                            ) : (
                                <ChevronRight
                                    className={`w-4 h-4 transition-transform ${expanded[cat.id] ? "rotate-90" : ""}`}
                                />
                            )}
                        </button>
                    )}
                </div>

                {hasChildren && expanded[cat.id] && (
                    <div className={`ml-${Math.min(level + 1, 6) * 4} mt-1`}>
                        {cat.children!.map((c) => renderCategory(c, level + 1))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <nav className="bg-white border-b border-gray-200 dark:bg-zinc-950 dark:border-zinc-800 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
                {/* Logo */}
                <Link to="/" className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    ShopVerse
                </Link>

                {/* Desktop Flat Menu: first-level categories */}
                <div className="hidden md:flex items-center gap-6">
                    {!loading && categories.length > 0 ? (
                        categories.map((cat) => (
                            <div key={cat.id} className="flex items-center gap-2">
                                <Link
                                    to={`/category/${cat.slug ?? cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                                    className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium px-2 py-1 rounded-md"
                                >
                                    {cat.name}
                                </Link>
                                {/* show subtle arrow if category has children */}
                                {cat.children && cat.children.length > 0 && (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                            </div>
                        ))
                    ) : (
                        // skeleton placeholders when loading
                        <div className="flex gap-4">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-zinc-800 rounded" />
                            <div className="h-4 w-14 bg-gray-200 dark:bg-zinc-800 rounded" />
                            <div className="h-4 w-16 bg-gray-200 dark:bg-zinc-800 rounded" />
                        </div>
                    )}
                </div>

                {/* Right actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/cart" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600"><FaCartPlus /></Link>
                    <Link to="/auth/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Sign In</Link>
                </div>

                {/* Mobile toggle */}
                <button className="md:hidden text-gray-800 dark:text-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile panel */}
            {mobileOpen && (
                <div className="md:hidden bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 shadow-lg">
                    <div className="p-4 space-y-1">
                        {loading ? (
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-800 rounded" />
                                <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-800 rounded" />
                                <div className="h-4 w-20 bg-gray-200 dark:bg-zinc-800 rounded" />
                            </div>
                        ) : (
                            categories.map((cat) => (
                                <div key={cat.id} className="border-b border-gray-100 dark:border-zinc-800 pb-2">
                                    {renderCategory(cat, 0)}
                                </div>
                            ))
                        )}

                        <div className="pt-3">
                            <Link to="/cart" className="block py-2 font-medium text-gray-800 dark:text-gray-100"><FaCartPlus /></Link>
                            <Link to="/login" className="block mt-2 w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg">Sign In</Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

// src/components/CategoryNavbar.tsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X, ChevronRight } from "lucide-react"
import { FaShoppingCart, FaSearch } from "react-icons/fa"
import { RxCross2 } from "react-icons/rx"
import Cart from "./Cart"

type RawCategory = {
    id: number
    name: string
    slug?: string
    parent?: number | null
    children?: RawCategory[]
}

export default function CategoryNavbar() {
    const [categories, setCategories] = useState<RawCategory[]>([])
    const [hoveredCategory, setHoveredCategory] = useState<RawCategory | null>(null)
    const [cartOpen, setCartOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [user, setUser] = useState<{ username?: string; avatar?: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [menuHovered, setMenuHovered] = useState(false)

    useEffect(() => {
        const demo: RawCategory[] = [
            {
                id: 1,
                name: "Men",
                slug: "men",
                children: [
                    {
                        id: 11,
                        name: "Clothing",
                        slug: "clothing",
                        children: [
                            { id: 111, name: "T-Shirts", slug: "t-shirts" },
                            { id: 112, name: "Jeans", slug: "jeans" },
                        ],
                    },
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
                    { id: 23, name: "Jewelry", slug: "jewelry" },
                ],
            },
            { id: 3, name: "Electronics", slug: "electronics" },
            { id: 4, name: "Home & Furniture", slug: "home-furniture" },
            { id: 5, name: "Offers", slug: "offers" },
        ]
        setCategories(demo)
        setLoading(false)

        try {
            const raw = localStorage.getItem("user")
            if (raw) {
                const parsed = JSON.parse(raw)
                setUser({ username: parsed.username || parsed.email || "User", avatar: parsed.profile_photo || "" })
            }
        } catch { }
    }, [])

    function handleCartToggle() {
        setCartOpen(!cartOpen)
    }

    function handleLogout() {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
        window.location.href = "/"
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
        }
    }

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 gap-4">
                {/* Left side: Logo + Hamburger */}
                <div className="flex items-center gap-3">
                    {/* Hamburger Menu */}
                    <div
                        className="relative"
                        onMouseEnter={() => setMenuHovered(true)}
                        onMouseLeave={() => {
                            setMenuHovered(false)
                            setHoveredCategory(null)
                        }}
                    >
                        <button
                            className="p-2 rounded-md hover:bg-gray-100 transition"
                            aria-label="Categories Menu"
                        >
                            {menuHovered ? <X size={22} /> : <Menu size={22} />}
                        </button>

                        {/* Dropdown Menu */}
                        {menuHovered && (
                            <div className="absolute top-full left-0 w-60 bg-white shadow-lg border rounded-md mt-2 z-50">
                                {loading ? (
                                    <div className="p-3 text-sm text-gray-500">Loading...</div>
                                ) : (
                                    categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="relative group"
                                            onMouseEnter={() => setHoveredCategory(cat)}
                                            onMouseLeave={() => setHoveredCategory(null)}
                                        >
                                            <Link
                                                to={`/category/${cat.slug}`}
                                                className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 text-gray-800 text-sm font-medium"
                                            >
                                                {cat.name}
                                                {cat.children && <ChevronRight size={14} />}
                                            </Link>

                                            {/* Subcategory Flyout */}
                                            {hoveredCategory?.id === cat.id && cat.children && (
                                                <div className="absolute top-0 left-full w-56 bg-white shadow-md border rounded-md ml-1">
                                                    {cat.children.map((child) => (
                                                        <div
                                                            key={child.id}
                                                            className="relative group"
                                                            onMouseEnter={() => setHoveredCategory(child)}
                                                            onMouseLeave={() => setHoveredCategory(cat)}
                                                        >
                                                            <Link
                                                                to={`/category/${child.slug}`}
                                                                className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                                                            >
                                                                {child.name}
                                                                {child.children && <ChevronRight size={12} />}
                                                            </Link>

                                                            {/* Nested Child */}
                                                            {hoveredCategory?.id === child.id && child.children && (
                                                                <div className="absolute top-0 left-full w-52 bg-white shadow-md border rounded-md ml-1">
                                                                    {child.children.map((sub) => (
                                                                        <Link
                                                                            key={sub.id}
                                                                            to={`/category/${sub.slug}`}
                                                                            className="block px-4 py-2 hover:bg-gray-50 text-gray-600 text-sm"
                                                                        >
                                                                            {sub.name}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Logo + Name */}
                    <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
                        <img
                            src="https://i.ibb.co/NnSYYC6d/Gemini-Generated-Image-6xewhm6xewhm6xew-1.png"
                            alt="logo"
                            width={45}
                            className="rounded-full"
                        />
                        <p>
                            <b className="text-red-500">AI</b>
                            <small className="text-green-500">Powered</small>{" "}
                            <i className="text-blue-500">Store</i>
                        </p>
                    </Link>
                </div>

                {/* Search bar */}
                <form
                    onSubmit={handleSearch}
                    className="flex-1 flex items-center max-w-xl mx-auto bg-gray-100 rounded-full px-3 py-1.5"
                >
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm px-2"
                    />
                    <button
                        type="submit"
                        className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-200"
                        aria-label="Search"
                    >
                        <FaSearch size={16} />
                    </button>
                </form>

                {/* Right side: Cart + User */}
                <div className="flex items-center gap-4">
                    {/* Cart */}
                    <div className="relative">
                        <button
                            onClick={handleCartToggle}
                            className="p-2 text-blue-500 rounded-md hover:bg-gray-100"
                            aria-label="Open cart"
                        >
                            <FaShoppingCart size={18} />
                        </button>
                        {cartOpen && (
                            <div className="absolute right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg p-4 z-50">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-medium">Your Cart</h3>
                                    <button onClick={() => setCartOpen(false)} className="p-1 rounded hover:bg-gray-200">
                                        <RxCross2 />
                                    </button>
                                </div>
                                <div className="mt-3">
                                    <Cart />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Auth/User */}
                    {!user ? (
                        <Link to="/auth/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
                            Sign In
                        </Link>
                    ) : (
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen((s) => !s)}
                                className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100"
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        (user.username || "U")[0].toUpperCase()
                                    )}
                                </div>
                                <span className="text-sm text-gray-700">{user.username}</span>
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md py-2">
                                    <Link to="/profile" className="block px-3 py-2 text-sm hover:bg-gray-50">
                                        Profile
                                    </Link>
                                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

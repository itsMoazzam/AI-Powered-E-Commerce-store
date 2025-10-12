import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../store"
import { Link } from "react-router-dom"
import {
    Menu,
    X,
    ChevronDown,
    ShoppingCart,
    Bell,
    MessageCircle,
    LogOut,

} from "lucide-react"

interface User {
    name: string
    avatar?: string
    role: "admin" | "seller" | "customer"
}

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [openMenu, setOpenMenu] = useState<string | null>(null)
    const [hoverMenu, setHoverMenu] = useState<string | null>(null)

    interface CartItem {
        id: string
        name: string
        qty: number
        // Add other fields if needed
    }

    interface CartState {
        items: CartItem[]
        // Add other fields if needed
    }

    const cartCount = useSelector((s: RootState) =>
        (s.cart as CartState).items.reduce((sum: number, i: CartItem) => sum + i.qty, 0)
    )


    // Example user data (replace with redux/auth context later)
    const user: User = {
        name: "Moazzam Tanveer",
        role: "admin",
        avatar: "", // empty means no profile picture
    }

    const toggleMobile = () => setMobileOpen(!mobileOpen)
    const toggleDropdown = (menu: string) =>
        setOpenMenu(openMenu === menu ? null : menu)

    // Get initials if no avatar
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-zinc-950 shadow">
            <div className="container mx-auto flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold text-zinc-900 dark:text-white">
                    IntelliStore
                </Link>

                {/* Center Menu */}
                <nav className="hidden md:flex space-x-6 text-zinc-700 dark:text-zinc-300">
                    <Link to="/" className="hover:text-blue-600">
                        Home
                    </Link>

                    {/* Products Dropdown (hover version) */}
                    <div
                        className="relative"
                        onMouseEnter={() => setHoverMenu("products")}
                        onMouseLeave={() => setHoverMenu(null)}
                    >
                        <button className="flex items-center hover:text-blue-600">
                            Products <ChevronDown className="w-4 h-4 ml-1" />
                        </button>
                        {hoverMenu === "products" && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                                <Link
                                    to="/products"
                                    className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    All Products
                                </Link>
                                <Link
                                    to="/products/electronics"
                                    className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    Electronics
                                </Link>
                                <div className="relative group">
                                    <button className="w-full text-left px-4 py-2 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                        Fashion
                                        <ChevronDown className="w-4 h-4 ml-1" />
                                    </button>
                                    <div className="absolute left-full top-0 mt-0 w-48 hidden group-hover:block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                                        <Link
                                            to="/products/fashion/men"
                                            className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        >
                                            Men
                                        </Link>
                                        <Link
                                            to="/products/fashion/women"
                                            className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        >
                                            Women
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link to="/about" className="hover:text-blue-600">
                        About
                    </Link>
                    <Link to="/contact" className="hover:text-blue-600">
                        Contact
                    </Link>
                </nav>

                {/* Right Icons */}
                <div className="hidden md:flex items-center space-x-4 text-zinc-700 dark:text-zinc-300">
                    <Link to="/cart" className="relative">
                        <ShoppingCart size={24} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    <Link to="/notifications" className="relative hover:text-blue-600">
                        <Bell className="w-6 h-6" />
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                            5
                        </span>
                    </Link>
                    <Link to="/messages" className="relative hover:text-blue-600">
                        <MessageCircle className="w-6 h-6" />
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                            2
                        </span>
                    </Link>

                    {/* Profile Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="profile"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold">
                                    {initials}
                                </div>
                            )}
                        </button>
                        <div className="absolute right-0 mt-2 w-40 hidden group-hover:block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                            <p className="px-4 py-2 text-sm text-zinc-500">
                                {user.role.toUpperCase()}
                            </p>
                            <Link
                                to="/profile"
                                className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                Profile
                            </Link>
                            <button className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Toggle Button */}
                <button className="md:hidden" onClick={toggleMobile}>
                    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                    <Link
                        to="/"
                        className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        Home
                    </Link>
                    <button
                        onClick={() => toggleDropdown("m-products")}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between"
                    >
                        Products <ChevronDown className="w-4 h-4" />
                    </button>
                    {openMenu === "m-products" && (
                        <div className="pl-6">
                            <Link
                                to="/products"
                                className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                All Products
                            </Link>
                            <Link
                                to="/products/electronics"
                                className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                Electronics
                            </Link>
                            <Link
                                to="/products/fashion/men"
                                className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                Fashion - Men
                            </Link>
                            <Link
                                to="/products/fashion/women"
                                className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                Fashion - Women
                            </Link>
                        </div>
                    )}
                    <Link
                        to="/about"
                        className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        About
                    </Link>
                    <Link
                        to="/contact"
                        className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        Contact
                    </Link>
                </div>
            )}
        </header>
    )
}

export default Navbar

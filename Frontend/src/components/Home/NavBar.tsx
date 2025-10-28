import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { FaShoppingCart, FaSearch, FaHeart } from "react-icons/fa";
// import { RxCross2 } from "react-icons/rx";
import CartDrawer from "./Cart";
import api from "../../lib/api";
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import type { Instance } from '@popperjs/core';

type Category = {
    id: number;
    name: string;
    slug?: string;
    children?: Category[];
};

export default function NavBar() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [user, setUser] = useState<{ username?: string; avatar?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuHovered, setMenuHovered] = useState(false);
    const [hoverPath, setHoverPath] = useState<number[]>([]);
    const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const positionRef = useRef<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const popperRef = useRef<Instance>(null);
    const areaRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (event: React.MouseEvent) => {
        positionRef.current = { x: event.clientX, y: event.clientY };

        if (popperRef.current != null) {
            popperRef.current.update();
        }
    };
    // Fetch categories from backend
    useEffect(() => {
        api.get("/api/products/categories/")
            .then(res => {
                console.log("Categories response:", res.data);
                setCategories(res.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));

        // Load user from localStorage
        try {
            const raw = localStorage.getItem("user");
            if (raw) {
                const parsed = JSON.parse(raw);
                setUser({
                    username: parsed.username || parsed.email || "User",
                    avatar: parsed.profile_photo || "",
                });
            }
        } catch {
            //ignore
        }
    }, []);

    const handleCartToggle = () => setCartOpen(!cartOpen);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/";
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
        }
    };

    const openMenu = menuHovered || menuOpen;

    const clearMenuTimeout = () => {
        if (menuTimeout.current) clearTimeout(menuTimeout.current);
    };

    const delayedCloseMenu = () => {
        clearMenuTimeout();
        menuTimeout.current = setTimeout(() => {
            setMenuHovered(false);
            setHoveredCategory(null);
            setHoverPath([]);
        }, 800);
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
            <div className="w-full px-4 md:px-6 lg:px-10 flex items-center justify-between h-16 gap-4">

                {/* Left side: Logo + Hamburger */}
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
                        <img
                            src="https://i.ibb.co/NnSYYC6d/Gemini-Generated-Image-6xewhm6xewhm6xew-1.png"
                            alt="logo"
                            width={45}
                            className="rounded-full"
                        />

                        <Tooltip
                            title="Intelligent E-commerce Store"
                            placement="top"
                            arrow
                            slotProps={{
                                popper: {
                                    popperRef,
                                    anchorEl: {
                                        getBoundingClientRect: () => {
                                            return new DOMRect(
                                                positionRef.current.x,
                                                areaRef.current!.getBoundingClientRect().y,
                                                0,
                                                20,
                                            );
                                        },
                                    },
                                },
                            }}
                        >

                            <Box ref={areaRef}
                                onMouseMove={handleMouseMove}>
                                <b className="text-red-500">I</b>
                                <b className="text-green-500">E</b>
                                <b className="text-blue-500">S</b>
                            </Box>
                        </Tooltip>

                    </Link>

                    {/* Hamburger / Categories */}
                    <div
                        className="relative"
                        onMouseEnter={() => {
                            clearMenuTimeout();
                            setMenuHovered(true);
                        }}
                        onMouseLeave={delayedCloseMenu}
                    >
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-1 rounded-md text-blue-500 hover:bg-gray-100 transition flex items-center gap-1 font-medium"
                        >
                            {openMenu ? <X size={22} /> : <Menu size={22} />}
                            Categories
                        </button>

                        {/* Dropdown */}
                        {openMenu && (
                            <div
                                className="absolute top-full left-0 w-64 bg-white shadow-lg border rounded-md mt-2 z-50"
                                onMouseEnter={clearMenuTimeout}
                                onMouseLeave={delayedCloseMenu}
                            >
                                {loading ? (
                                    <div className="p-3 text-sm text-gray-500">Loading...</div>
                                ) : (
                                    categories.map(cat => (
                                        <div
                                            key={cat.id}
                                            className="relative group"
                                            onMouseEnter={() => {
                                                clearMenuTimeout();
                                                setHoveredCategory(cat);
                                                setHoverPath([cat.id]);
                                            }}
                                            onMouseLeave={delayedCloseMenu}
                                        >
                                            <Link
                                                to={`/category/${cat.slug}`}
                                                className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 text-gray-800 text-sm font-medium"
                                            >
                                                {cat.name}
                                                {cat.children && ""}
                                            </Link>

                                            {/* Subcategories Flyout */}
                                            {hoverPath.includes(cat.id) && cat.children && (
                                                <div
                                                    className="absolute top-0 left-full w-56 bg-white shadow-md border rounded-md ml-1"
                                                    onMouseEnter={clearMenuTimeout}
                                                    onMouseLeave={delayedCloseMenu}
                                                >
                                                    {cat.children.map(child => (
                                                        <div
                                                            key={child.id}
                                                            className="relative group"
                                                            onMouseEnter={() => {
                                                                clearMenuTimeout();
                                                                setHoveredCategory(child);
                                                                setHoverPath([cat.id, child.id]);
                                                            }}
                                                            onMouseLeave={delayedCloseMenu}
                                                        >
                                                            <Link
                                                                to={`/category/${child.slug}`}
                                                                className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                                                            >
                                                                {child.name}
                                                                {child.children && ""}
                                                            </Link>

                                                            {hoverPath.includes(child.id) && child.children && (
                                                                <div
                                                                    className="absolute top-0 left-full w-52 bg-white shadow-md border rounded-md ml-1"
                                                                    onMouseEnter={clearMenuTimeout}
                                                                    onMouseLeave={delayedCloseMenu}
                                                                >
                                                                    {child.children.map(sub => (
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
                        onChange={e => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm px-2 text-gray-800"
                    />
                    <button
                        type="submit"
                        className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-200"
                        aria-label="Search"
                    >
                        <FaSearch size={16} />
                    </button>
                </form>

                {/* Right side: Wishlist + Cart + User */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/wishlist"
                        className="p-2 text-pink-500 rounded-md hover:bg-gray-100"
                        aria-label="Wishlist"
                    >
                        <FaHeart size={18} />
                    </Link>

                    {/* Cart */}
                    <div className="relative">
                        <button
                            onClick={handleCartToggle}
                            className="p-2 text-blue-500 rounded-md hover:bg-gray-100"
                            aria-label="Open cart"
                        >
                            <FaShoppingCart size={18} />
                        </button>
                        <CartDrawer open={cartOpen} setOpen={setCartOpen} />

                    </div>

                    {/* User Auth */}
                    {!user ? (
                        <Link
                            to="/auth/login"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                        >
                            Sign In
                        </Link>
                    ) : (
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(s => !s)}
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
                                    <Link to="/profile" className="block px-3 py-2 text-sm hover:bg-gray-50">Profile</Link>
                                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Logout</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav >
    );
}

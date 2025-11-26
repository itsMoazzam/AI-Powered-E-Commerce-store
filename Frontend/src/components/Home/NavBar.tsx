import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { FaShoppingCart, FaSearch, FaHeart, FaHome } from "react-icons/fa";
import CartDrawer from "./Cart";
import api from "../../lib/api";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import type { Instance } from "@popperjs/core";
import ThreeDot from "../threeDot";

type Category = {
    id: number;
    name: string;
    slug?: string;
    children?: Category[];
};

type User = {
    username?: string;
    avatar?: string;
    role?: "admin" | "seller" | "customer";
};

export default function NavBar() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuHovered, setMenuHovered] = useState(false);
    const [hoverPath, setHoverPath] = useState<number[]>([]);
    const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const userMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const positionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const popperRef = useRef<Instance>(null);
    const areaRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (event: React.MouseEvent) => {
        positionRef.current = { x: event.clientX, y: event.clientY };
        if (popperRef.current) popperRef.current.update();
    };

    // Fetch categories and user
    useEffect(() => {
        api.get("/api/products/categories/")
            .then((res) => setCategories(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));

        try {
            const raw = localStorage.getItem("user");
            if (raw) {
                const parsed = JSON.parse(raw);

                // Robust role detection: prefer an explicit `role` property, then common backend flags.
                // Some backends use `is_superuser`/`is_staff`/`is_admin` for admin, or `is_seller` for seller.
                let role: User['role'] = 'customer';
                if (parsed.role && (parsed.role === 'admin' || parsed.role === 'seller' || parsed.role === 'customer')) {
                    role = parsed.role;
                } else if (parsed.is_superuser || parsed.is_staff || parsed.is_admin) {
                    role = 'admin';
                } else if (parsed.is_seller || parsed.is_seller === true) {
                    role = 'seller';
                } else {
                    role = 'customer';
                }

                setUser({
                    username: parsed.username || parsed.email || 'User',
                    avatar: parsed.profile_photo || '',
                    role,
                });
            }
        } catch {
            // ignore
        }
    }, []);

    const handleCartToggle = () => setCartOpen(!cartOpen);

    const handleLogout = () => {
        // close menu first so UI updates immediately
        setUserMenuOpen(false);
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

    const clearUserMenuTimeout = () => {
        if (userMenuTimeout.current) {
            clearTimeout(userMenuTimeout.current);
            userMenuTimeout.current = null;
        }
    };

    const delayedCloseUserMenu = (ms = 3000) => {
        clearUserMenuTimeout();
        userMenuTimeout.current = setTimeout(() => {
            setUserMenuOpen(false);
        }, ms);
    };

    const toggleUserMenu = () => {
        setUserMenuOpen((s) => {
            const next = !s;
            if (next) {
                // opening: cancel any pending close
                clearUserMenuTimeout();
            }
            return next;
        });
    };

    // cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            clearMenuTimeout();
            clearUserMenuTimeout();
        };
    }, []);

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
                                        getBoundingClientRect: () =>
                                            new DOMRect(
                                                positionRef.current.x,
                                                areaRef.current!.getBoundingClientRect().y,
                                                0,
                                                20
                                            ),
                                    },
                                },
                            }}
                        >
                            <Box ref={areaRef} onMouseMove={handleMouseMove}>
                                <b className="text-red-500">I</b>
                                <b className="text-green-500">E</b>
                                <b className="text-blue-500">S</b>
                            </Box>
                        </Tooltip>
                    </Link>

                    {/* Categories Dropdown */}
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
                            className="p-1 rounded-md text-blue-500 hover:bg-gray-100 transition flex items-center gap-1 font-medium cursor-pointer"
                        >
                            {openMenu ? <X size={22} /> : <Menu size={22} />}
                            Categories
                        </button>

                        {openMenu && (
                            <div
                                className="absolute top-full left-0 w-64 bg-white shadow-lg border rounded-md mt-2 z-50"
                                onMouseEnter={clearMenuTimeout}
                                onMouseLeave={delayedCloseMenu}
                            >
                                {loading ? (
                                    <div className="p-3 text-sm text-gray-500"><ThreeDot /></div>
                                ) : (
                                    categories.map((cat) => (
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
                                            </Link>

                                            {hoverPath.includes(cat.id) && cat.children && (
                                                <div
                                                    className="absolute top-0 left-full w-56 bg-white shadow-md border rounded-md ml-1"
                                                    onMouseEnter={clearMenuTimeout}
                                                    onMouseLeave={delayedCloseMenu}
                                                >
                                                    {cat.children.map((child) => (
                                                        <Link
                                                            key={child.id}
                                                            to={`/category/${child.slug}`}
                                                            className="block px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                                                        >
                                                            {child.name}
                                                        </Link>
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm px-2 text-gray-800"
                    />
                    <button
                        type="submit"
                        className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-200 cursor-pointer"
                        aria-label="Search"
                    >
                        <FaSearch size={16} />
                    </button>
                </form>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* Wishlist & Cart visible only to customers. Sellers/Admins see a Home icon linking to their dashboard. */}
                    {user?.role === "customer" ? (
                        <>

                            <Link
                                to="/wishlist"
                                className="p-2 text-pink-500 rounded-md hover:bg-gray-100"
                                aria-label="Wishlist"
                            >
                                <FaHeart size={18} />
                            </Link>

                            <div className="relative">
                                <button
                                    onClick={handleCartToggle}
                                    className="p-2 text-blue-500 rounded-md hover:bg-gray-100 cursor-pointer"
                                    aria-label="Open cart"
                                >
                                    <FaShoppingCart size={18} />
                                </button>
                                <CartDrawer open={cartOpen} setOpen={setCartOpen} />
                            </div>
                        </>
                    ) : user ? (

                        // Seller and Admin: do not show wishlist or cart. Show a home icon linking to the relevant dashboard.
                        <Link
                            to={user.role === "seller" ? "/seller" : "/admin"}
                            className="p-2 text-blue-700 rounded-md hover:bg-gray-100"
                            aria-label="Dashboard"
                            onClick={() => setUserMenuOpen(false)}
                        >
                            <FaHome size={18} />
                        </Link>
                    ) : null}

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
                                onClick={toggleUserMenu}
                                className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="avatar"
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        (user.username || "U")[0].toUpperCase()
                                    )}
                                </div>
                                <span className="text-sm text-gray-700">{user.username}</span>
                            </button>

                            {userMenuOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-40 bg-white text-gray-700 border rounded-md shadow-md py-2 "
                                    onMouseEnter={clearUserMenuTimeout}
                                    onMouseLeave={() => delayedCloseUserMenu(1000)}
                                >
                                    <Link
                                        to="/profile"
                                        className="block px-3 py-2 text-sm hover:bg-gray-50"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            // close menu immediately and then logout
                                            setUserMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

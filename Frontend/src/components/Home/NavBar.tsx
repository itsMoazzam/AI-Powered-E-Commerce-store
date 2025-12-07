import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Star, ChevronRight } from "lucide-react";
import { FaShoppingCart, FaSearch, FaHeart, FaHome } from "react-icons/fa";
import CartDrawer from "./Cart";
import { useTheme } from '../../theme/ThemeProvider'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
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
    const [, setHoveredCategory] = useState<Category | null>(null);
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
    const { toggle, setPrimary, setText, setBg, setSurface, setTheme } = useTheme();
    const cartCount = useSelector((s: RootState) => s.cart.items?.length || 0)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])
    const [topOpen, setTopOpen] = useState(false)
    const [topSeller, setTopSeller] = useState<any>(null)
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const themeMenuRef = useRef<HTMLDivElement>(null)
    const topWrapperRef = useRef<HTMLDivElement>(null)
    const [themeMenuOpen, setThemeMenuOpen] = useState(false)

    // Mobile responsive states
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchBarOpen, setSearchBarOpen] = useState(false)
    const [mobileCategory, setMobileCategory] = useState<Category | null>(null)

    const handleMouseMove = (event: React.MouseEvent) => {
        positionRef.current = { x: event.clientX, y: event.clientY };
        if (popperRef.current) popperRef.current.update();
    };

    // Fetch categories and user
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        api.get("/api/products/categories/")
            .then((res) => {
                if (isMounted) setCategories(res.data)
            })
            .catch((err) => {
                if (isMounted) console.error(err)
            })
            .finally(() => { if (isMounted) setLoading(false) })

        try {
            const raw = localStorage.getItem("user");
            if (raw) {
                const parsed = JSON.parse(raw);
                let role: User['role'] = 'customer';
                if (parsed.role && (parsed.role === 'admin' || parsed.role === 'seller' || parsed.role === 'customer')) {
                    role = parsed.role;
                } else if (parsed.is_superuser || parsed.is_staff || parsed.is_admin) {
                    role = 'admin';
                } else if (parsed.is_seller || parsed.is_seller === true) {
                    role = 'seller';
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

        return () => { isMounted = false; };
    }, []);

    // Load notifications
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const { data } = await api.get('/api/notifications/?limit=5')
                if (isMounted) setNotifications(Array.isArray(data) ? data : [])
            } catch (err) {
                // Backend may not have notifications endpoint; set empty array
                if (isMounted) setNotifications([])
            }
        })()
        return () => { isMounted = false; }
    }, [])

    const handleCartToggle = () => setCartOpen(!cartOpen);

    const themePresets = [
        { name: 'Default', bg: '#ffffff', surface: '#ffffff', text: '#111827', primary: '#6366f1' },
        { name: 'Midnight', bg: '#0b1220', surface: '#0f1724', text: '#e6eef8', primary: '#7c3aed' },
        { name: 'Sage', bg: '#f6fffb', surface: '#ecfdf5', text: '#052e25', primary: '#10b981' },
    ]

    const applyPreset = (p: { bg: string; surface: string; text: string; primary: string }) => {
        try {
            setBg(p.bg)
            setSurface(p.surface)
            setText(p.text)
            setPrimary(p.primary)
            setTheme('custom')
        } catch (err) {
            // ignore
        }
        setThemeMenuOpen(false)
    }

    // Close menus when clicking outside
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            const path = e.composedPath ? e.composedPath() : (e as any).path || []
            if (themeMenuRef.current && !path.includes(themeMenuRef.current)) {
                setThemeMenuOpen(false)
            }
            if (topWrapperRef.current && !path.includes(topWrapperRef.current)) {
                setTopOpen(false)
            }
        }
        document.addEventListener('click', onDocClick)
        return () => document.removeEventListener('click', onDocClick)
    }, [])

    const handleTopClick = async () => {
        setTopOpen((s) => !s)
        if (!topSeller) {
            try {
                const { data } = await api.get('/api/sellers/top/')
                setTopSeller(data)
            } catch (err) {
                setTopSeller({ name: 'Top Seller', rating: 4.9 })
            }
        }
    }

    const handleLogout = () => {
        setUserMenuOpen(false);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/";
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTimer.current) clearTimeout(searchTimer.current)
        searchTimer.current = setTimeout(() => {
            if (searchQuery.trim()) {
                window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
            }
        }, 350)
    };

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
                clearUserMenuTimeout();
            }
            return next;
        });
    };

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
        <>
            <nav className="border-b sticky top-0 z-50 w-full border-theme transition-all duration-300" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                <div className="w-full px-2 sm:px-4 md:px-6 lg:px-10 flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 nav-gradient">

                    {/* Mobile: Hamburger */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-md transition"
                        style={{ color: 'var(--color-primary)' }}
                        title="Menu"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* Left side: Logo + Categories (Desktop Only) */}
                    <div className="hidden md:flex items-center gap-2 sm:gap-4">
                        <Link to="/" className="flex items-center gap-1 sm:gap-2 text-lg sm:text-2xl font-extrabold text-default flex-shrink-0">
                            <img
                                src="https://i.ibb.co/NnSYYC6d/Gemini-Generated-Image-6xewhm6xewhm6xew-1.png"
                                alt="logo"
                                className="rounded-full logo-spin w-8 h-8 sm:w-10 sm:h-10"
                            />
                            <span className="hidden sm:flex items-center gap-0.5">
                                <Tooltip title="Intelligent E-commerce Store" placement="top" arrow>
                                    <Box ref={areaRef} onMouseMove={handleMouseMove} className="flex gap-0.5 cursor-pointer">
                                        <b className="text-red-500">I</b>
                                        <b className="text-green-500">E</b>
                                        <b className="text-blue-500">S</b>
                                    </Box>
                                </Tooltip>
                            </span>
                        </Link>

                        {/* Categories Dropdown - Desktop */}
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
                                className="p-2 rounded-md transition flex items-center gap-1 font-medium cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 text-sm"
                                style={{ color: 'var(--color-primary)' }}
                            >
                                {menuOpen ? <X size={18} /> : <Menu size={18} />}
                                <span className="hidden md:inline">Categories</span>
                            </button>

                            {(menuOpen || menuHovered) && (
                                <div
                                    className="absolute top-full left-0 w-56 sm:w-64 bg-surface shadow-lg border border-card rounded-md mt-2 z-50"
                                    onMouseEnter={clearMenuTimeout}
                                    onMouseLeave={delayedCloseMenu}
                                >
                                    {loading ? (
                                        <div className="p-3 text-sm text-muted"><ThreeDot /></div>
                                    ) : (
                                        categories.slice(0, 8).map((cat) => (
                                            <div
                                                key={cat.id}
                                                className="relative group"
                                                onMouseEnter={() => {
                                                    setHoverPath([cat.id]);
                                                    setHoveredCategory(cat);
                                                }}
                                                onMouseLeave={delayedCloseMenu}
                                            >
                                                <Link
                                                    to={`/category/${cat.slug}`}
                                                    className="block px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 text-default text-sm flex items-center justify-between"
                                                >
                                                    {cat.name}
                                                    {cat.children && cat.children.length > 0 && <ChevronRight size={14} />}
                                                </Link>

                                                {hoverPath.includes(cat.id) && cat.children && (
                                                    <div
                                                        className="absolute left-full top-0 w-56 bg-surface shadow-lg border border-card rounded-md mt-0 ml-2 z-50"
                                                        onMouseEnter={clearMenuTimeout}
                                                        onMouseLeave={delayedCloseMenu}
                                                    >
                                                        {cat.children.map((child) => (
                                                            <Link
                                                                key={child.id}
                                                                to={`/category/${child.slug}`}
                                                                className="block px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 text-default text-sm truncate"
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

                    {/* Mobile: Logo (center when no hamburger) */}
                    <Link to="/" className="md:hidden flex items-center gap-1 text-lg font-extrabold text-default">
                        <img
                            src="https://i.ibb.co/NnSYYC6d/Gemini-Generated-Image-6xewhm6xewhm6xew-1.png"
                            alt="logo"
                            className="rounded-full logo-spin w-7 h-7"
                        />
                        <span className="flex items-center gap-0.5">
                            <b className="text-red-500 text-sm">I</b>
                            <b className="text-green-500 text-sm">E</b>
                            <b className="text-blue-500 text-sm">S</b>
                        </span>
                    </Link>

                    {/* Desktop Search bar */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden lg:flex flex-1 flex items-center max-w-lg mx-auto rounded-full px-3 py-1.5 border border-card"
                        style={{ background: 'var(--bg)' }}
                    >
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm px-2 placeholder-gray-500"
                            style={{ color: 'var(--text)' }}
                        />
                        <button
                            type="submit"
                            className="p-2 rounded-full cursor-pointer transition hover:scale-110"
                            style={{ color: 'var(--color-primary-text)', background: 'var(--color-primary)' }}
                            aria-label="Search"
                        >
                            <FaSearch size={14} />
                        </button>
                    </form>

                    {/* Right side - Icons & Auth */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Desktop: Theme, Notifications, Top Sellers */}
                        <button
                            title="Toggle theme"
                            onClick={toggle}
                            className="hidden md:flex p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            <Sun size={16} />
                        </button>

                        {/* Desktop: Theme Menu */}
                        <div className="hidden lg:block relative" ref={themeMenuRef}>
                            <button
                                title="Theme"
                                onClick={() => setThemeMenuOpen((s) => !s)}
                                className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                                style={{ color: 'var(--color-primary)' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 2a6 6 0 100 12A6 6 0 0010 2z" />
                                </svg>
                            </button>
                            {themeMenuOpen && (
                                <div className="absolute right-0 mt-2 w-44 border border-card rounded-md shadow-lg p-2 z-50" style={{ background: 'var(--surface)' }}>
                                    <div className="text-xs font-medium mb-2 text-muted">THEMES</div>
                                    <div className="flex flex-col gap-2">
                                        {themePresets.map((p) => (
                                            <button key={p.name} onClick={() => applyPreset(p)} className="flex items-center justify-between px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-sm" style={{ color: 'var(--text)' }}>
                                                <span className="text-xs">{p.name}</span>
                                                <span className="w-5 h-5 rounded border border-card" style={{ background: p.primary }} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Desktop: Top Sellers */}
                        <div className="hidden lg:block relative" ref={topWrapperRef}>
                            <button
                                title="Top sellers"
                                onClick={handleTopClick}
                                className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                                style={{ color: 'var(--color-primary)' }}
                            >
                                <Star size={16} />
                            </button>
                            {topOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 border border-card rounded-md shadow-lg p-3 z-50" style={{ background: 'var(--surface)' }}>
                                    <div className="text-xs font-medium mb-2 text-muted">TOP SELLER</div>
                                    <div className="text-sm text-default">{topSeller ? `${topSeller.name} — ${topSeller.rating}★` : 'Loading...'}</div>
                                </div>
                            )}
                        </div>

                        {/* Desktop: Notifications */}
                        <div className="hidden lg:block relative">
                            <button
                                onClick={() => setNotificationsOpen((s) => !s)}
                                className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 relative"
                                style={{ color: 'var(--color-primary)' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                                    <path d="M9 18a2 2 0 104 0H9z" />
                                </svg>
                                {notifications.length > 0 && <span className="notif-badge absolute -top-1 -right-1">{notifications.length}</span>}
                            </button>
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-surface border border-card rounded-md shadow-lg p-2 z-50">
                                    <div className="text-sm font-medium mb-2 text-default">Notifications</div>
                                    <div className="space-y-2 max-h-60 overflow-auto">
                                        {notifications.length === 0 && <div className="text-xs text-muted py-3 text-center">No notifications</div>}
                                        {notifications.map((n, i) => (
                                            <div key={i} className="p-2 border-b border-card text-sm hover:bg-black/5 dark:hover:bg-white/5 rounded">
                                                <div className="font-medium text-default text-xs">{n.title || 'Notification'}</div>
                                                <div className="text-xs text-muted mt-1">{n.message || n.summary}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Customer: Wishlist & Cart - Desktop Only */}
                        {user?.role === "customer" && (
                            <>
                                <Link
                                    to="/wishlist"
                                    className="hidden md:flex p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition"
                                    style={{ color: '#ec4899' }}
                                    aria-label="Wishlist"
                                >
                                    <FaHeart size={16} />
                                </Link>

                                <div className="hidden md:block relative">
                                    <button
                                        onClick={handleCartToggle}
                                        className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer relative transition"
                                        aria-label="Open cart"
                                        style={{ color: 'var(--color-primary)' }}
                                    >
                                        <FaShoppingCart size={16} />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-2 notif-badge">{cartCount}</span>
                                        )}
                                    </button>
                                    <CartDrawer open={cartOpen} setOpen={setCartOpen} />
                                </div>
                            </>
                        )}

                        {/* Seller/Admin: Home - Desktop Only */}
                        {user && user.role !== "customer" && (
                            <Link
                                to={user.role === "seller" ? "/seller" : "/admin"}
                                className="hidden md:flex p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer relative transition"
                                style={{ color: 'var(--color-primary)' }}
                                aria-label="Dashboard"
                                onClick={() => setUserMenuOpen(false)}
                            >
                                <FaHome size={16} />
                            </Link>
                        )}

                        {/* Mobile: Search Icon */}
                        <button
                            onClick={() => setSearchBarOpen(!searchBarOpen)}
                            className="md:hidden p-2 rounded-md"
                            style={{ color: 'var(--color-primary)' }}
                            aria-label="Search"
                        >
                            <FaSearch size={16} />
                        </button>

                        {/* User Auth */}
                        {!user ? (
                            <Link
                                to="/auth/login"
                                className="text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition hover:shadow-lg"
                                style={{ background: 'var(--color-primary)' }}
                            >
                                <span className="hidden sm:inline">Sign In</span>
                                <span className="sm:hidden">Login</span>
                            </Link>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={toggleUserMenu}
                                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition"
                                >
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base font-medium border border-card" style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}>
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
                                    <span className="text-xs sm:text-sm hidden sm:inline text-default max-w-[80px] truncate">{user.username}</span>
                                </button>

                                {userMenuOpen && (
                                    <div
                                        className="absolute right-0 mt-2 w-40 bg-surface text-default border border-card rounded-md shadow-md py-2 z-50"
                                        onMouseEnter={clearUserMenuTimeout}
                                        onMouseLeave={() => delayedCloseUserMenu(1000)}
                                    >
                                        <Link
                                            to="/profile"
                                            className="block px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Search Bar - Show Below Navbar */}
                {searchBarOpen && (
                    <form
                        onSubmit={handleSearch}
                        className="md:hidden w-full px-2 sm:px-4 py-2 border-t border-card flex items-center gap-2"
                        style={{ background: 'var(--bg)' }}
                    >
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            className="flex-1 bg-transparent outline-none text-sm px-2 placeholder-gray-500"
                            style={{ color: 'var(--text)' }}
                        />
                        <button
                            type="submit"
                            className="p-2 rounded-full cursor-pointer transition"
                            style={{ color: 'var(--color-primary-text)', background: 'var(--color-primary)' }}
                            aria-label="Search"
                        >
                            <FaSearch size={14} />
                        </button>
                    </form>
                )}
            </nav>

            {/* Mobile Menu Sidebar */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-14 sm:top-16 z-40 overflow-hidden">
                    <div
                        className="absolute inset-0"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div
                        className="absolute left-0 top-0 bottom-0 w-64 sm:w-72 border-r border-card shadow-lg overflow-y-auto"
                        style={{ background: 'var(--surface)' }}
                    >
                        {/* Mobile Menu Content */}
                        <div className="p-4 space-y-2">
                            {/* Categories */}
                            {loading ? (
                                <div className="p-3 text-sm text-muted"><ThreeDot /></div>
                            ) : mobileCategory ? (
                                <>
                                    <button
                                        onClick={() => setMobileCategory(null)}
                                        className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-sm text-default mb-2"
                                        style={{ color: 'var(--color-primary)' }}
                                    >
                                        <ChevronRight size={16} className="rotate-180" />
                                        <span>Back</span>
                                    </button>
                                    <div className="text-xs font-semibold text-muted px-3 py-2">{mobileCategory.name}</div>
                                    {mobileCategory.children && mobileCategory.children.map((child) => (
                                        <Link
                                            key={child.id}
                                            to={`/category/${child.slug}`}
                                            className="block px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-sm text-default"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {child.name}
                                        </Link>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <div className="text-xs font-semibold text-muted px-3 py-2">CATEGORIES</div>
                                    {categories.map((cat) => (
                                        <div key={cat.id}>
                                            <div className="flex items-center justify-between">
                                                <Link
                                                    to={`/category/${cat.slug}`}
                                                    className="flex-1 px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-sm text-default"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {cat.name}
                                                </Link>
                                                {cat.children && cat.children.length > 0 && (
                                                    <button
                                                        onClick={() => setMobileCategory(cat)}
                                                        className="px-2 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5"
                                                        style={{ color: 'var(--color-primary)' }}
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* Mobile Menu Divider */}
                            <div className="border-t border-card my-4" />

                            {/* Mobile: Wishlist & Cart for customers */}
                            {user?.role === "customer" && (
                                <>
                                    <Link
                                        to="/wishlist"
                                        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-sm text-default"
                                        onClick={() => setMobileMenuOpen(false)}
                                        style={{ color: '#ec4899' }}
                                    >
                                        <FaHeart size={16} />
                                        <span>Wishlist</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setCartOpen(true);
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-sm text-default w-full"
                                        style={{ color: 'var(--color-primary)' }}
                                    >
                                        <FaShoppingCart size={16} />
                                        <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
                                    </button>
                                </>
                            )}

                            {/* Mobile: Dashboard for seller/admin */}
                            {user && user.role !== "customer" && (
                                <Link
                                    to={user.role === "seller" ? "/seller" : "/admin"}
                                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-sm text-default"
                                    onClick={() => setMobileMenuOpen(false)}
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    <FaHome size={16} />
                                    <span>Dashboard</span>
                                </Link>
                            )}

                            {/* Mobile: Theme Toggle */}
                            <div className="border-t border-card my-4" />
                            <button
                                onClick={() => {
                                    toggle();
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-sm text-default w-full"
                                style={{ color: 'var(--color-primary)' }}
                            >
                                <Sun size={16} />
                                <span>Toggle Theme</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

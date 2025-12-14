import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Star } from "lucide-react";
import { FaShoppingCart, FaSearch, FaHeart, FaHome, FaCat } from "react-icons/fa";
import CartDrawer from "./Cart";
import { useTheme } from '../../theme/ThemeProvider'
import api from "../../lib/api";
import { loadCartFromStorage, getCartStorageKey } from '../../lib/cart'
import { RiCustomerService2Fill } from "react-icons/ri";
import { FaToggleOff } from "react-icons/fa6";

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

interface NavBarProps {
    setLoginModalOpen: (open: boolean) => void;
    // whether login modal is currently open (optional)
    loginModalOpen?: boolean;
}

export default function NavBar({ setLoginModalOpen }: NavBarProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [categories, setCategories] = useState<Category[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [, setHoveredCategory] = useState<Category | null>(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [menuHovered, setMenuHovered] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [hoverPath, setHoverPath] = useState<number[]>([]);
    const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const userMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { toggle, setPrimary, setText, setBg, setSurface, setTheme } = useTheme();
    const [localCartCount, setLocalCartCount] = useState<number>(0)
    const [localWishlistCount, setLocalWishlistCount] = useState<number>(0)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])
    const [topOpen, setTopOpen] = useState(false)
    const [topSeller, setTopSeller] = useState<any>(null)
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const suggestionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const themeMenuRef = useRef<HTMLDivElement>(null)
    const topWrapperRef = useRef<HTMLDivElement>(null)
    // Mobile responsive states
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchBarOpen, setSearchBarOpen] = useState(false)

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

    // Initialize cart/wishlist counts from localStorage or backend as needed
    useEffect(() => {
        let isMounted = true
        const refreshCounts = async () => {
            try {
                // cart count from local storage (per-user)
                try {
                    const cart = loadCartFromStorage()
                    if (isMounted) setLocalCartCount(Array.isArray(cart.items) ? cart.items.length : 0)
                } catch (e) {
                    // fallback to legacy key
                    const cartRaw = localStorage.getItem('intelligentCommerce_cart')
                    const cartObj = cartRaw ? JSON.parse(cartRaw) : null
                    const cartCount = Array.isArray(cartObj?.items) ? cartObj.items.length : 0
                    if (isMounted) setLocalCartCount(cartCount)
                }

                // wishlist - use getWishlist which handles server/local fallback
                try {
                    // dynamic import to avoid circular deps
                    const wishlistModule = await import('../../lib/wishlist')
                    const list = await wishlistModule.getWishlist()
                    if (isMounted) setLocalWishlistCount(Array.isArray(list) ? list.length : 0)
                } catch (e) {
                    // fallback: read from localStorage
                    const wRaw = localStorage.getItem('intelligentCommerce_wishlist')
                    const wArr = wRaw ? JSON.parse(wRaw) : []
                    if (isMounted) setLocalWishlistCount(wArr.length)
                }
            } catch (err) {
                // ignore
            }
        }
        refreshCounts()

        const onStorage = (e: StorageEvent) => {
            try {
                // Any per-user cart key change should update the badge. We detect keys that start with the prefix.
                if (typeof e.key === 'string' && e.key.indexOf('intelligentCommerce_cart') === 0) {
                    try {
                        const cObj = e.newValue ? JSON.parse(e.newValue) : null
                        setLocalCartCount(Array.isArray(cObj?.items) ? cObj.items.length : 0)
                    } catch { }
                }
            } catch (e) { /* ignore */ }

            if (e.key === 'intelligentCommerce_wishlist') {
                try {
                    const w = e.newValue ? JSON.parse(e.newValue) : []
                    setLocalWishlistCount(Array.isArray(w) ? w.length : 0)
                } catch { }
            }
        }
        const onCartUpdated = (ev: Event) => {
            try {
                const detail: any = (ev as CustomEvent).detail
                const count = Array.isArray(detail?.items) ? detail.items.length : (detail?.length ?? 0)
                if (detail?.items) setLocalCartCount(count)
                else if (typeof detail === 'number') setLocalCartCount(detail)
                else {
                    // fallback: read storage
                    const cRaw = localStorage.getItem('intelligentCommerce_cart')
                    const cObj = cRaw ? JSON.parse(cRaw) : null
                    setLocalCartCount(Array.isArray(cObj?.items) ? cObj.items.length : 0)
                }
            } catch { }
        }
        const onWishlistUpdated = (ev: Event) => {
            try {
                const detail: any = (ev as CustomEvent).detail
                if (Array.isArray(detail)) setLocalWishlistCount(detail.length)
                else if (typeof detail === 'number') setLocalWishlistCount(detail)
                else {
                    const wRaw = localStorage.getItem('intelligentCommerce_wishlist')
                    const wArr = wRaw ? JSON.parse(wRaw) : []
                    setLocalWishlistCount(Array.isArray(wArr) ? wArr.length : 0)
                }
            } catch { }
        }

        window.addEventListener('storage', onStorage)
        window.addEventListener('intelligentCommerce_cart_updated', onCartUpdated as EventListener)
        window.addEventListener('intelligentCommerce_wishlist_updated', onWishlistUpdated as EventListener)

        return () => {
            isMounted = false
            window.removeEventListener('storage', onStorage)
            window.removeEventListener('intelligentCommerce_cart_updated', onCartUpdated as EventListener)
            window.removeEventListener('intelligentCommerce_wishlist_updated', onWishlistUpdated as EventListener)
        }
    }, [])

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            {/* Top utility bar: shows extra links and quick icons (especially for customers) */}
            <div className="w-full text-sm" style={{ background: '#FFF7ED', color: 'var(--text)' }}>
                <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-10 flex items-center justify-between h-10">
                    <div className="flex items-center gap-3">
                    </div>

                    <div className="flex items-center gap-3">

                        {/* Desktop: Top Sellers */}
                        <div className="hidden lg:block relative" ref={topWrapperRef}>
                            <button
                                title="Top sellers"
                                onClick={handleTopClick}
                                className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                                style={{ color: 'var(--color-primary)' }}
                            >
                                <Star size={20} />
                            </button>
                            {topOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 border border-card rounded-md shadow-lg p-3 z-50" style={{ background: 'var(--surface)' }}>
                                    <div className="text-xs font-medium mb-2 text-muted">TOP SELLER</div>
                                    <div className="text-sm text-default">{topSeller ? `${topSeller.name} — ${topSeller.rating}★` : 'Loading...'}</div>
                                </div>
                            )}
                        </div>
                        {/* Wishlist visible to customers and guests (local fallback) */}
                        {(user?.role === 'customer' || !user) && (
                            <Link to="/wishlist" className="hidden sm:inline p-1 rounded hover:bg-black/5 relative" style={{ color: 'var(--color-primary)' }} title="Wishlist">
                                <FaHeart size={20} />
                                {localWishlistCount > 0 && <span className="notif-badge absolute -top-2 -right-2">{localWishlistCount}</span>}
                            </Link>
                        )}

                        {/* Desktop: Notifications */}
                        <div className="hidden lg:block relative">
                            <button
                                onClick={() => setNotificationsOpen((s) => !s)}
                                className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 relative"
                                style={{ color: 'var(--color-primary)' }}
                                title="Notifications"
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
                                            <div key={`notif-${i}`} className="p-2 border-b border-card text-sm hover:bg-black/5 dark:hover:bg-white/5 rounded">
                                                <div className="font-medium text-default text-xs">{n.title || 'Notification'}</div>
                                                <div className="text-xs text-muted mt-1">{n.message || n.summary}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/help" className="hidden sm:inline p-1 rounded hover:bg-black/5 relative" style={{ color: 'var(--color-primary)' }} title="Help & Support"><RiCustomerService2Fill size={20} />
                        </Link>

                        {!user ? (
                            <>
                                <button onClick={() => setLoginModalOpen(true)} className="text-sm hidden sm:inline">Sign In</button>
                                <Link to="/auth/register" className="text-sm hidden sm:inline">Sign Up</Link>
                            </>
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
                                        className="absolute right-0 mt-2 w-40 bg-surface text-default border border-card rounded-md shadow-md py-2 z-100"
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
                                        <div className="px-3 py-2">
                                            <div className="text-xs text-muted mb-2">Theme</div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { toggle(); setUserMenuOpen(false); }} className="px-2 py-1 text-sm rounded border border-card"><FaToggleOff />
                                                </button>
                                                {themePresets.map((p) => (
                                                    <button key={p.name} onClick={() => { applyPreset(p); setUserMenuOpen(false); }} className="w-6 h-6 rounded border" style={{ background: p.primary }} aria-label={`Apply ${p.name}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* )} */}
                    </div>
                </div>
            </div>

            <nav className="border-b sticky top-0 z-50 w-full border-theme transition-all duration-300" style={{ background: '#FFF7ED', color: 'var(--text)' }}>
                <div className="w-full px-2 sm:px-4 md:px-6 lg:px-10 flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-2 nav-gradient">

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
                    <div className="hidden md:flex items-center gap-1 sm:gap-1">
                        <Link to="/" className="flex items-center gap-3 text-2xl sm:text-3xl font-extrabold text-default flex-shrink-0">
                            <img
                                src="https://i.ibb.co/NnSYYC6d/Gemini-Generated-Image-6xewhm6xewhm6xew-1.png"
                                alt="logo"
                                className="rounded-full logo-spin w-10 h-10 sm:w-12 sm:h-12"
                            />
                            <span className="hidden sm:flex items-center ">

                                <p style={{ color: '#3b82f6' }}>IES</p>
                            </span>
                        </Link>
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

                    {/* Desktop Search bar (centered) */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden lg:flex flex-1 flex items-center max-w-xl mx-2 rounded-full px-3 py-2 border border-card relative"
                        style={{ background: 'var(--bg)' }}
                    >
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => {
                                const q = e.target.value
                                setSearchQuery(q)
                                // Debounce suggestions
                                if (suggestionTimer.current) clearTimeout(suggestionTimer.current)
                                suggestionTimer.current = setTimeout(async () => {
                                    try {
                                        if (!q || q.trim() === '') {
                                            setSuggestions([])
                                            return
                                        }
                                        const { data } = await api.get('/api/products/', { params: { search_text: q, page_size: 6 } })
                                        const list = data?.results ?? data ?? []
                                        setSuggestions(Array.isArray(list) ? list.slice(0, 6) : [])
                                        setShowSuggestions(true)
                                    } catch (err) {
                                        setSuggestions([])
                                    }
                                }, 300)
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className="flex-1 bg-transparent outline-none text-md px-3 placeholder-gray-500"
                            style={{ color: 'var(--text)' }}
                        />

                        <button
                            type="submit"
                            className="p-3 rounded-full cursor-pointer transition hover:scale-110"
                            style={{ color: 'var(--color-primary-text)', background: 'var(--color-primary)' }}
                            aria-label="Search"
                            title="Search"
                        >
                            <FaSearch size={16} />
                        </button>

                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 mt-14 max-h-64 overflow-auto bg-surface border border-card rounded shadow-lg z-50">
                                <ul>
                                    {suggestions.map((s: any) => (
                                        <li key={`sug-${s.id ?? s.title}`} className="px-3 py-2 hover:bg-black/5">
                                            <a href={`/product/${s.id}`} className="flex items-center gap-3">
                                                <img src={s.thumbnail || '/placeholder.png'} alt={s.title} className="w-10 h-10 object-cover rounded" />
                                                <div className="truncate">
                                                    <div className="text-sm font-medium">{s.title}</div>
                                                    <div className="text-xs text-muted">${Number(s.price ?? 0).toFixed(2)}</div>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </form>

                    {/* On large screens: show Dashboard for seller/admin; Cart for customers or guests */}
                    {user && user.role !== 'customer' ? (
                        <Link
                            to={user.role === 'seller' ? '/seller' : '/admin'}
                            className="hidden lg:inline-flex p-2 rounded-md relative ml-2"
                            style={{ color: 'var(--color-primary)' }}
                            aria-label="Dashboard"
                            title="Dashboard"
                        >
                            <FaHome size={20} />
                        </Link>
                    ) : (
                        <button
                            onClick={() => setCartOpen(true)}
                            className="hidden lg:inline-flex p-2 rounded-md relative ml-2"
                            style={{ color: 'var(--color-primary)' }}
                            aria-label="Cart"
                            title="Cart"
                        >
                            <FaShoppingCart size={20} />
                            {localCartCount > 0 && <span className="notif-badge absolute -top-2 -right-2">{localCartCount}</span>}
                        </button>
                    )}

                    {/* Right side - Icons & Auth (keeps compact functions: profile, menu) */}
                    <div className="flex items-center gap-1 sm:gap-2">


                        {/* Seller/Admin: Home - Desktop Only */}
                        {user && user.role !== "customer" && (
                            <Link
                                to={user.role === "seller" ? "/seller" : "/admin"}
                                className="hidden md:flex lg:hidden p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer relative transition"
                                style={{ color: 'var(--color-primary)' }}
                                aria-label="Dashboard"
                                onClick={() => setUserMenuOpen(false)}
                            >
                                <FaHome size={26} />
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
                            {/* Simplified mobile links (categories removed from navbar) */}
                            <div>
                                <Link to="/" className="block px-3 py-2 rounded hover:bg-black/5 text-sm text-default" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                                <Link to="/categories" className="block px-3 py-2 rounded hover:bg-black/5 text-sm text-default" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
                                {(user?.role === 'customer' || !user) && <Link to="/wishlist" className="block px-3 py-2 rounded hover:bg-black/5 text-sm text-default" onClick={() => setMobileMenuOpen(false)}>Wishlist {localWishlistCount > 0 && `(${localWishlistCount})`}</Link>}
                                <Link to="/cart" className="block px-3 py-2 rounded hover:bg-black/5 text-sm text-default" onClick={() => setMobileMenuOpen(false)}>Cart</Link>
                                <Link to="/help" className="block px-3 py-2 rounded hover:bg-black/5 text-sm text-default" onClick={() => setMobileMenuOpen(false)}>Help & Support</Link>
                            </div>

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
                                        <span>Cart {localCartCount > 0 && `(${localCartCount})`}</span>
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
                            <div className="px-3 py-2 text-sm text-muted">Account & Settings</div>
                            {user ? (
                                <>
                                    <Link to="/profile" className="block px-3 py-2 rounded hover:bg-black/5 text-sm text-default" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded hover:bg-black/5 text-sm text-default">Logout</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => { setLoginModalOpen(true); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded hover:bg-black/5 text-sm text-default">Login</button>
                                    <Link to="/auth/register" className="block px-3 py-2 rounded hover:bg-black/5 text-sm text-default" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Cart Drawer (shared) */}
            <CartDrawer open={cartOpen} setOpen={setCartOpen} />
        </>
    );
}

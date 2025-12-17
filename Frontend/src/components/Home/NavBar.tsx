import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Star } from "lucide-react";
import { FaShoppingCart, FaSearch, FaHeart, FaHome, FaCat, FaSun, FaMoon, FaReceipt } from "react-icons/fa";
import { loadOrderHistory } from '../../lib/checkout'
import CartDrawer from "./Cart";
import { useTheme } from '../../theme/ThemeProvider'
import api from "../../lib/api";
import { loadCartFromStorage, getCartStorageKey } from '../../lib/cart'
import { RiCustomerService2Fill } from "react-icons/ri";
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
    setLoginAnchor?: (r: { top: number; left: number; bottom: number; right: number; width: number; height: number } | null) => void;
}

export default function NavBar({ setLoginModalOpen, setLoginAnchor }: NavBarProps) {
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
    const { theme, toggle, setPrimary, setText, setBg, setSurface, setTheme } = useTheme();
    const navigate = useNavigate();
    const [localCartCount, setLocalCartCount] = useState<number>(0)
    const [localWishlistCount, setLocalWishlistCount] = useState<number>(0)
    const [localOrdersCount, setLocalOrdersCount] = useState<number>(0)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])
    const [topOpen, setTopOpen] = useState(false)
    const [topSellers, setTopSellers] = useState<any[]>([])
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
        // Use fetch here (no auth header) so guests don't get redirected by api interceptor on 401
        fetch('/api/products/categories/')
            .then(async (res) => {
                if (!res.ok) throw res
                const data = await res.json()
                if (isMounted) setCategories(data)
            })
            .catch((err) => { if (isMounted) console.error(err) })
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
                    if (isMounted) {
                        // only show counts for logged-in customers
                        const raw = localStorage.getItem('user')
                        const parsed = raw ? JSON.parse(raw) : null
                        const role = parsed?.role || localStorage.getItem('role')
                        if (parsed && role === 'customer') setLocalCartCount(Array.isArray(cart.items) ? cart.items.length : 0)
                        else setLocalCartCount(0)
                    }
                } catch (e) {
                    // fallback to legacy key
                    const cartRaw = localStorage.getItem('intelligentCommerce_cart')
                    const cartObj = cartRaw ? JSON.parse(cartRaw) : null
                    const cartCount = Array.isArray(cartObj?.items) ? cartObj.items.length : 0
                    if (isMounted) {
                        const raw = localStorage.getItem('user')
                        const parsed = raw ? JSON.parse(raw) : null
                        const role = parsed?.role || localStorage.getItem('role')
                        if (parsed && role === 'customer') setLocalCartCount(cartCount)
                        else setLocalCartCount(0)
                    }
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
                // orders history local count (per-user)
                try {
                    const raw = localStorage.getItem('user')
                    const parsed = raw ? JSON.parse(raw) : null
                    const role = parsed?.role || localStorage.getItem('role')
                    if (parsed && role === 'customer') {
                        const localOrders = loadOrderHistory() || []
                        if (isMounted) setLocalOrdersCount(Array.isArray(localOrders) ? localOrders.length : 0)
                    } else {
                        if (isMounted) setLocalOrdersCount(0)
                    }
                } catch { if (isMounted) setLocalOrdersCount(0) }
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
                        const raw = localStorage.getItem('user')
                        const parsed = raw ? JSON.parse(raw) : null
                        const role = parsed?.role || localStorage.getItem('role')
                        if (!(parsed && role === 'customer')) return
                        const cObj = e.newValue ? JSON.parse(e.newValue) : null
                        setLocalCartCount(Array.isArray(cObj?.items) ? cObj.items.length : 0)
                    } catch { }
                }
                // If user login state changed in another tab, update local user and counts
                if (e.key === 'user') {
                    try {
                        const newUser = e.newValue ? JSON.parse(e.newValue) : null
                        if (newUser) {
                            let role: User['role'] = 'customer'
                            if (newUser.role && (newUser.role === 'admin' || newUser.role === 'seller' || newUser.role === 'customer')) role = newUser.role
                            else if (newUser.is_superuser || newUser.is_staff || newUser.is_admin) role = 'admin'
                            else if (newUser.is_seller) role = 'seller'
                            setUser({ username: newUser.username || newUser.email || 'User', avatar: newUser.profile_photo || '', role })
                        } else {
                            setUser(null)
                            setLocalCartCount(0)
                            setLocalWishlistCount(0)
                            setLocalOrdersCount(0)
                        }
                    } catch { }
                }
            } catch (e) { /* ignore */ }

            if (e.key === 'intelligentCommerce_wishlist') {
                try {
                    const w = e.newValue ? JSON.parse(e.newValue) : []
                    setLocalWishlistCount(Array.isArray(w) ? w.length : 0)
                } catch { }
            }
            if (e.key === 'intelligentCommerce_orderHistory') {
                try {
                    const arr = e.newValue ? JSON.parse(e.newValue) : []
                    setLocalOrdersCount(Array.isArray(arr) ? arr.length : 0)
                } catch { }
            }
        }
        const onCartUpdated = (ev: Event) => {
            try {
                const detail: any = (ev as CustomEvent).detail
                const count = Array.isArray(detail?.items) ? detail.items.length : (detail?.length ?? 0)
                // only update badge for authenticated customers
                try {
                    const raw = localStorage.getItem('user')
                    const parsed = raw ? JSON.parse(raw) : null
                    const role = parsed?.role || localStorage.getItem('role')
                    if (!(parsed && role === 'customer')) return
                } catch (e) { return }

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

    // Load notifications (only for logged-in users)
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                if (!user) {
                    if (isMounted) setNotifications([])
                    return
                }

                // Only attempt to fetch notifications when we have a local token
                // (this avoids unnecessary 401 responses when user info exists
                // but no valid auth token is available, such as when using
                // session cookies that may have expired).
                const token = localStorage.getItem('token')
                if (!token) {
                    if (isMounted) setNotifications([])
                    return
                }

                const headers: Record<string, string> = { 'Accept': 'application/json' }
                if (token) headers['Authorization'] = `Bearer ${token}`

                const nres = await fetch('/api/notifications/?limit=5', { headers })
                if (!nres.ok) {
                    // quietly ignore expected auth/404 responses
                    if (isMounted) setNotifications([])
                    return
                }
                const data = await nres.json()
                if (isMounted) setNotifications(Array.isArray(data) ? data : [])
            } catch (err) {
                // Backend may not have notifications endpoint; set empty array
                if (isMounted) setNotifications([])
            }
        })()
        return () => { isMounted = false; }
    }, [user])

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
        if (topSellers.length > 0) return

        // Try backend top sellers first; if unavailable or empty, fallback to advertisements
        try {
            const tres = await fetch('/api/seller/top/')
            if (tres.ok) {
                const data = await tres.json()
                if (Array.isArray(data) && data.length > 0) {
                    // normalize seller shape so name/store fields are available in UI
                    const normalize = (raw: any) => {
                        const s = raw?.seller ?? raw?.user ?? raw
                        const id = raw?.id ?? s?.id
                        const displayName = s?.user?.profile?.full_name ?? s?.user?.full_name ?? s?.full_name ?? (s?.first_name && s?.last_name ? `${s.first_name} ${s.last_name}` : null) ?? s?.name ?? s?.username ?? null
                        const businessName = raw?.business_name ?? s?.business_name ?? s?.store_name ?? s?.shop_name ?? null
                        const count = raw?.count ?? raw?.ads_count ?? null
                        return { ...raw, id, displayName, businessName, count }
                    }
                    setTopSellers(data.map(normalize))
                    return
                }
            }
        } catch (err) {
            // ignore — try fallback
        }

        try {
            const ares = await fetch('/api/advertisements/?limit=100')
            if (!ares.ok) throw ares
            const ads = await ares.json()
            const counts: Record<string, number> = {}
            for (const ad of (Array.isArray(ads) ? ads : [])) {
                if (ad && ad.seller_id) counts[String(ad.seller_id)] = (counts[String(ad.seller_id)] || 0) + 1
            }
            const sellers = Object.entries(counts).map(([id, cnt]) => ({ id: Number(id), name: `Seller ${id}`, count: cnt }))
            sellers.sort((a: any, b: any) => b.count - a.count)
            setTopSellers(sellers.slice(0, 8))
        } catch (err) {
            // As a last resort show a placeholder
            setTopSellers([{ id: 0, name: 'Top Seller', count: 0 }])
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
            <div className="w-full text-sm hidden md:block" style={{ background: '#dbf5fdff', color: 'var(--text)' }}>
                <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-10 flex items-center justify-between h-10">
                    <div className="flex items-center gap-3">
                    </div>

                    <div className="flex items-center gap-3">

                        {/* Desktop: Top Sellers */}
                        <div className="hidden lg:block relative" ref={topWrapperRef}>
                            <button
                                title="Top sellers"
                                onClick={handleTopClick}
                                className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-black/5 cursor-pointer"
                                style={{ color: 'var(--color-primary)' }}
                            >
                                <Star size={20} />
                            </button>
                            {topOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 border border-card rounded-md shadow-lg p-3" style={{ background: 'var(--surface)', zIndex: 9999 }}>
                                    <div className="text-xs font-medium mb-2 text-muted">TOP SELLERS</div>
                                    <div className="space-y-2 max-h-64 overflow-auto">
                                        {topSellers.length === 0 && <div className="text-sm text-default">Loading...</div>}
                                        {topSellers.map((s: any, i: number) => (
                                            <div key={`topseller-${s.id || i}`} className="flex items-center justify-between text-sm">
                                                <div className="truncate">
                                                    <div className="font-medium line-clamp-1">{s.displayName ?? s.name ?? `Seller ${s.id}`}</div>
                                                    {(s.businessName || s.business_name) && <div className="text-xs text-muted line-clamp-1">{s.businessName ?? s.business_name}</div>}
                                                </div>
                                                <div className="text-xs text-muted">{s.count ? `${s.count} ads` : ''}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Wishlist visible to customers and guests (local fallback) */}
                        {/* Top sellers (star) */}
                        {/* Orders (customer-only) placed between Top Sellers and Wishlist */}
                        {(user?.role === 'customer') && (
                            <Link to="/orders" className="hidden sm:inline p-1 rounded hover:bg-black/5 relative" style={{ color: 'var(--color-primary)' }} title="My Orders">
                                <FaReceipt size={20} />
                                {localOrdersCount > 0 && <span className="notif-badge absolute -top-2 -right-2">{localOrdersCount}</span>}
                            </Link>
                        )}
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
                                className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-black/5 relative cursor-pointer"
                                style={{ color: 'var(--color-primary)' }}
                                title="Notifications"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                                    <path d="M9 18a2 2 0 104 0H9z" />
                                </svg>
                                {notifications.length > 0 && <span className="notif-badge absolute -top-1 -right-1">{notifications.length}</span>}
                            </button>
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-surface border border-card rounded-md shadow-lg p-2" style={{ zIndex: 9999 }}>
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
                                {/* <button onClick={() => { setLoginAnchor && setLoginAnchor(null); setLoginModalOpen(true); }} className="text-sm hidden sm:inline inline-flex items-center justify-center cursor-pointer" style={{ color: 'var(--color-primary)' }}>Sign In</button> */}
                                <button onClick={() => { navigate('/auth/login') }} className="text-sm hidden sm:inline inline-flex items-center justify-center cursor-pointer" style={{ color: 'var(--color-primary)' }}>Sign In</button>

                                <Link to="/register" className="text-sm hidden sm:inline" style={{ color: 'var(--color-primary)' }}>Sign Up</Link>
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
                                        className="absolute right-0 mt-2 w-40 bg-surface text-default border border-card rounded-md shadow-md py-2"
                                        onMouseEnter={clearUserMenuTimeout}
                                        onMouseLeave={() => delayedCloseUserMenu(1000)}
                                        style={{ zIndex: 9999 }}
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
                                                <button
                                                    onClick={() => { toggle(); setUserMenuOpen(false); }}
                                                    aria-label="Toggle theme"
                                                    className="relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none"
                                                    style={{ background: theme === 'dark' ? 'var(--color-primary)' : '#e5e7eb' }}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-1'}`} />
                                                    <span className="absolute -right-6 text-xs" aria-hidden>{theme === 'dark' ? <FaMoon /> : <FaSun />}</span>
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

            <nav className="border-b sticky top-0 z-50 w-full border-theme transition-all duration-300" >
                <div className="w-full px-2 sm:px-4 md:px-6 lg:px-10 flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-2 pb-5 nav-gradient" style={{ background: '#dbf5fdff', color: 'var(--text)' }}>

                    {/* Mobile: Hamburger */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-md transition"
                        style={{ color: 'var(--color-primary)' }}
                        title="Menu"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>



                    {/* Mobile: Logo (center when no hamburger) */}
                    <Link to="/" className="md:hidden flex items-center gap-1 text-lg font-extrabold text-default">
                        <img
                            src="https://i.ibb.co/NnSYYC6d/Gemini-Generated-Image-6xewhm6xewhm6xew-1.png"
                            alt="logo"
                            className="rounded-full logo-spin w-7 h-7"
                        />
                        <span className="flex items-center gap-0.5">
                            <p style={{ color: '#3b82f6' }} title="Intelligent Ecommerce Store">IES</p>

                        </span>
                    </Link>

                    {/* Desktop Search bar (centered) */}
                    <div className=" lg:flex flex-1 flex items-center max-w-full  rounded-full px-3 py-2"
                    >
                        <div className="hidden md:flex items-center gap-1 sm:gap-1 mx-9">
                            <Link to="/" className="flex items-center gap-2 text-2xl sm:text-3xl font-extrabold text-default flex-shrink-0">
                                <img
                                    src="https://i.ibb.co/NnSYYC6d/Gemini-Generated-Image-6xewhm6xewhm6xew-1.png"
                                    alt="logo"
                                    className="rounded-full logo-spin w-10 h-10 sm:w-12 sm:h-12"
                                />
                                <span className="hidden sm:flex items-center ">

                                    <p style={{ color: '#3b82f6' }} title="Intelligent Ecommerce Store">IES</p>
                                </span>
                            </Link>
                        </div>
                        <form
                            onSubmit={handleSearch}
                            className="hidden lg:flex w-[60%] items-center mx-2 rounded-full px-3 py-2 border border-card relative"
                            style={{ background: 'var(--bg)' }}
                        >
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => {
                                    const q = e.target.value
                                    setSearchQuery(q)
                                    // Debounce/throttle suggestions to 1.5s and present short 2-3 word snippets
                                    if (suggestionTimer.current) clearTimeout(suggestionTimer.current)
                                    suggestionTimer.current = setTimeout(async () => {
                                        try {
                                            if (!q || q.trim() === '') {
                                                setSuggestions([])
                                                return
                                            }
                                            // Use fetch for suggestions to avoid triggering axios auth redirect for guests
                                            const sres = await fetch(`/api/products/?search_text=${encodeURIComponent(q)}&page_size=12`)
                                            if (!sres.ok) throw sres
                                            const sdata = await sres.json()
                                            const list = sdata?.results ?? sdata ?? []

                                            // Build small phrase snippets (2-3 words) from titles/descriptions/categories
                                            const phrases: string[] = []
                                            for (const p of (Array.isArray(list) ? list : [])) {
                                                if (p.title) phrases.push(String(p.title))
                                                if (p.description) {
                                                    const first = String(p.description).split(/[.?!]\s/)[0]
                                                    if (first) phrases.push(first)
                                                }
                                                if (p.category) {
                                                    if (typeof p.category === 'string') phrases.push(p.category)
                                                    else if (p.category?.name) phrases.push(String(p.category.name))
                                                }
                                                if (p.categories && Array.isArray(p.categories)) {
                                                    for (const c of p.categories) {
                                                        if (!c) continue
                                                        if (typeof c === 'string') phrases.push(c)
                                                        else if (c.name) phrases.push(String(c.name))
                                                    }
                                                }
                                            }

                                            const freq = new Map<string, number>()
                                            phrases.forEach(ph => {
                                                const normalized = ph.trim()
                                                if (!normalized) return
                                                freq.set(normalized, (freq.get(normalized) ?? 0) + 1)
                                            })

                                            // Take the most frequent and truncate to 3 words, dedupe
                                            const sorted = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).map(([k]) => k)
                                            const snippets: string[] = []
                                            const mkSnippet = (s: string) => s.split(/\s+/).slice(0, 3).join(' ')
                                            for (const s of sorted) {
                                                const sn = mkSnippet(s)
                                                if (!sn) continue
                                                if (!snippets.includes(sn)) snippets.push(sn)
                                                if (snippets.length >= 12) break
                                            }
                                            setSuggestions(snippets)
                                            setShowSuggestions(true)
                                        } catch (err) {
                                            setSuggestions([])
                                        }
                                    }, 1500)
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

                            {/* Suggestions dropdown (phrases) */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute left-0 right-0 top-full max-h-content overflow-auto-hidden bg-blue-50 border border-card rounded shadow-lg" style={{ zIndex: 9999, pointerEvents: 'auto', borderRadius: '5%' }}>
                                    <ul>
                                        {suggestions.map((s: any, i: number) => (
                                            <li key={`sug-${i}`} className="px-3 py-2 hover:bg-black/5">
                                                <button className="w-full text-left" onMouseDown={() => { setSearchQuery(s); window.location.href = `/search?query=${encodeURIComponent(s)}`; }}>{s}</button>
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
                                className="hidden lg:inline-flex p-2 rounded-md relative ml-2 cursor-pointer"
                                style={{ color: 'var(--color-primary)' }}
                                aria-label="Dashboard"
                                title="Dashboard"
                            >
                                <FaHome size={26} />
                            </Link>
                        ) : (
                            <button
                                onClick={() => {
                                    // customers can open the drawer; guests are redirected to login
                                    if (user?.role === 'customer') {
                                        setCartOpen(true)
                                    } else {
                                        navigate('/auth/login')
                                    }
                                }}
                                className="hidden lg:inline-flex p-2 rounded-md relative ml-5 cursor-pointer"
                                style={{ color: 'var(--color-primary)' }}
                                aria-label="Cart"
                                title="Cart"
                            >
                                <FaShoppingCart size={26} />
                                {user && user.role === 'customer' && localCartCount > 0 && <span className="notif-badge absolute -top-2 -right-2">{localCartCount}</span>}
                            </button>
                        )}
                    </div>
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
                    <div className="absolute inset-0" onClick={() => setMobileMenuOpen(false)} />

                    <div className="absolute left-0 top-0 bottom-0 w-64 sm:w-72 border-r border-card shadow-lg overflow-y-auto" style={{ background: 'var(--surface)' }}>
                        {/* Mobile Menu Content */}
                        <div className="p-4 space-y-2">
                            <div>
                                <Link to="/" className="block px-3 py-2 rounded hover:bg-black/5 text-sm text-default" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                                <Link to="/categories" className="block px-3 py-2 rounded hover:bg-black/5 text-sm text-default" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
                                {(user?.role === 'customer' || !user) && (
                                    <Link to="/wishlist" className="block px-3 py-2 rounded hover:bg-black/5 text-sm text-default" onClick={() => setMobileMenuOpen(false)}>Wishlist {localWishlistCount > 0 && `(${localWishlistCount})`}</Link>
                                )}

                                {user?.role === 'customer' ? (
                                    <Link to="/cart" className="block px-3 py-2 rounded hover:bg-black/5 text-sm text-default" onClick={() => setMobileMenuOpen(false)}>Cart</Link>
                                ) : (
                                    <button onClick={() => { navigate('/auth/login'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded hover:bg-black/5 text-sm text-default">Cart</button>
                                )}

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
                                    <button onClick={() => { setLoginAnchor && setLoginAnchor(null); setLoginModalOpen(true); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded hover:bg-black/5 text-sm text-default">Login</button>
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

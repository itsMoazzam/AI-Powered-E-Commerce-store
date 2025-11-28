
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
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
    const { theme, toggle, setPrimary, setText, setBg, setSurface, setContrast, text, bg, surface, contrast } = useTheme();
    const cartCount = useSelector((s: RootState) => s.cart.items?.length || 0)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleMouseMove = (event: React.MouseEvent) => {
        positionRef.current = { x: event.clientX, y: event.clientY };
        if (popperRef.current) popperRef.current.update();
    };

    // Fetch categories and user (abort previous if any)
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

        return () => { isMounted = false; };
    // load a small notifications preview (non-critical)
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const { data } = await api.get('/api/notifications/?limit=5')
                if (isMounted) setNotifications(Array.isArray(data) ? data : [])
            } catch (err) {
                // ignore — endpoint optional
            }
        })()
        return () => { isMounted = false; }
    }, [])
        return () => { isMounted = false }
    }, [])

    const handleCartToggle = () => setCartOpen(!cartOpen);

    const handlePrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrimary(e.target.value)
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value)
    }

    const handleContrastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value)
        if (!Number.isNaN(val) && val > 0) setContrast(val)
    }

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
        if (searchTimer.current) clearTimeout(searchTimer.current)
        // debounce quick typing
        searchTimer.current = setTimeout(() => {
            if (searchQuery.trim()) {
                window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
            }
        }, 350)
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
                <div className="w-full px-4 md:px-6 lg:px-10 flex items-center justify-between h-16 gap-4 nav-gradient">

                {/* Left side: Logo + Hamburger */}
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-default">
                        <img
                            src="https://i.ibb.co/NnSYYC6d/Gemini-Generated-Image-6xewhm6xewhm6xew-1.png"
                            alt="logo"
                            width={45}
                            className="rounded-full logo-spin"
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
                                className="absolute top-full left-0 w-64 bg-surface shadow-lg border-card rounded-md mt-2 z-50"
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
                    className="flex-1 flex items-center max-w-xl mx-auto bg-gray-100/60 dark:bg-zinc-800 rounded-full px-3 py-1.5"
                >
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm px-2 text-default"
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
                                    className="p-2 text-blue-500 rounded-md hover:bg-gray-100 cursor-pointer relative"
                                    aria-label="Open cart"
                                >
                                    <FaShoppingCart size={18} />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
                                    )}
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

                    {/* Theme toggle + color picker */}
                    <div className="flex items-center gap-2">
                        <button
                            title="Toggle theme"
                            onClick={toggle}
                            className="p-2 rounded-md hover:bg-gray-100 nav-hide-sm"
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>

                        <input
                            aria-label="Primary color"
                            title="Pick primary color"
                            type="color"
                            defaultValue={String((window?.getComputedStyle?.(document.documentElement) || {}).getPropertyValue('--color-primary') || '#6366f1').trim()}
                            onChange={handlePrimaryChange}
                            className="w-8 h-8 p-0 border-0 bg-transparent"
                        />

                        <input
                            aria-label="Text color"
                            title="Pick text color"
                            type="color"
                            defaultValue={text || '#111827'}
                            onChange={handleTextChange}
                            className="w-8 h-8 p-0 border-0 bg-transparent"
                        />

                        <input
                            aria-label="Contrast"
                            title="Adjust contrast"
                            type="range"
                            min={50}
                            max={150}
                            defaultValue={String(contrast || 100)}
                            onChange={handleContrastChange}
                            className="w-20 h-2"
                        />
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button onClick={() => setNotificationsOpen((s) => !s)} className="p-2 rounded-md hover:bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-default" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                                <path d="M9 18a2 2 0 104 0H9z" />
                            </svg>
                            {notifications.length > 0 && <span className="notif-badge -mt-2 -ml-2 inline-block">{notifications.length}</span>}
                        </button>
                        {notificationsOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-surface border-card rounded-md shadow-lg p-2 z-50">
                                <div className="text-sm font-medium mb-2">Notifications</div>
                                <div className="space-y-2 max-h-60 overflow-auto">
                                    {notifications.length === 0 && <div className="text-xs text-muted">No notifications</div>}
                                    {notifications.map((n, i) => (
                                        <div key={i} className="p-2 border-b border-card text-sm">
                                            <div className="font-medium text-default">{n.title || 'Notification'}</div>
                                            <div className="text-xs text-muted">{n.message || n.summary}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
            </div>
        </nav>
    );
}

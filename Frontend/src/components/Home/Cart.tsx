import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';
import { loadCartFromStorage, removeFromCart } from '../../lib/cart'

export default function CartDrawer({ open, setOpen }: { open: boolean; setOpen: (val: boolean) => void }) {
    const { primary } = useTheme();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const navigate = useNavigate();

    // If a non-customer somehow opens the drawer, redirect to login and close
    useEffect(() => {
        if (!open) return
        try {
            const raw = localStorage.getItem('user')
            const parsed = raw ? JSON.parse(raw) : null
            const role = parsed?.role || localStorage.getItem('role')
            if (!(parsed && role === 'customer')) {
                setOpen(false)
                navigate('/auth/login')
            }
        } catch (e) {
            setOpen(false)
            navigate('/auth/login')
        }
    }, [open])

    useEffect(() => {
        if (open) {
            // Load cart from localStorage when drawer opens
            const cart = loadCartFromStorage()
            const safe = (cart.items || []).map((it: any) => ({
                id: it.id,
                title: String(it.title ?? ''),
                thumbnail: String(it.thumbnail ?? ''),
                price: Number(it.price ?? 0),
                quantity: Number(it.qty ?? it.quantity ?? 1),
                subtotal: Number(it.subtotal ?? (Number(it.price ?? 0) * Number(it.qty ?? 1)))
            }))
            setCartItems(safe)
        }
    }, [open]);

    const removeItem = (id: number) => {
        try {
            // Remove from localStorage
            removeFromCart(id)
            // Update local state
            setCartItems(cartItems.filter(item => item.id !== id))
        } catch (err) {
            console.error('❌ Failed to remove item:', err);
        }
    };

    const subtotal = Array.isArray(cartItems)
        ? cartItems.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0)
        : 0;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setOpen(false)} />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 overflow-hidden">
                <div className="w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl flex flex-col overflow-y-auto" style={{ background: 'var(--surface)' }}>
                    {/* Header */}
                    <div className="flex items-start justify-between px-4 sm:px-6 py-4 border-b border-theme">
                        <h2 className="text-lg sm:text-xl font-semibold text-default">🛒 Your Cart</h2>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition p-1"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {!Array.isArray(cartItems) || cartItems.length === 0 ? (
                            <div className="text-center py-8 text-muted">
                                <div className="text-2xl mb-2">🛍️</div>
                                <p>Your cart is empty.</p>
                            </div>
                        ) : (
                            <ul className="space-y-4 divide-y divide-card">
                                {cartItems.map((item: any) => (
                                    <li key={item.id} className="flex gap-3 sm:gap-4 py-4">
                                        <img
                                            src={item.thumbnail || "/placeholder.png"}
                                            alt={item.title || "Product"}
                                            className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg border border-card object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 flex flex-col min-w-0">
                                            <h3 className="text-sm sm:text-base font-semibold text-default truncate">{String(item.title ?? '')}</h3>
                                            <div className="flex justify-between items-start mt-1">
                                                <div>
                                                    <p className="text-xs sm:text-sm text-muted">Qty: <span className="font-medium">{Number(item.quantity ?? 1)}</span></p>
                                                    <p className="text-sm sm:text-base font-bold text-default mt-1">${(Number(item.price ?? 0) * Number(item.quantity ?? 1)).toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="mt-2 text-xs sm:text-sm font-medium transition hover:opacity-70"
                                                style={{ color: primary }}
                                            >
                                                ✕ Remove
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="border-t border-theme px-4 sm:px-6 py-4 space-y-4">
                            <div className="flex justify-between text-base sm:text-lg font-bold text-default">
                                <p>Subtotal</p>
                                <p className="text-lg" style={{ color: primary }}>${subtotal.toFixed(2)}</p>
                            </div>
                            <p className="text-xs sm:text-sm text-muted">
                                Shipping and taxes calculated at checkout.
                            </p>
                            <button
                                disabled={!cartItems.length}
                                onClick={() => { setOpen(false); navigate('/checkout') }}
                                className="w-full rounded-lg px-4 py-2.5 sm:py-3 font-semibold text-white transition hover:shadow-lg disabled:opacity-60"
                                style={{ background: primary }}
                            >
                                Proceed to Checkout
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-full rounded-lg px-4 py-2.5 sm:py-3 font-medium transition hover:bg-black/5 dark:hover:bg-white/5 text-default"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

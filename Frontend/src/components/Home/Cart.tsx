import { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';
import api from '../../lib/api'
import { useDispatch } from 'react-redux'
import { fetchCart } from '../../store/Cart'

export default function CartDrawer({ open, setOpen }: { open: boolean; setOpen: (val: boolean) => void }) {
    const { primary } = useTheme();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch()

    useEffect(() => {
        if (open) fetchCartItems();
    }, [open]);

    const fetchCartItems = async () => {
        try {
            setLoading(true)
            const { data } = await api.get('/api/cart/')
            setCartItems(data.items || [])
        } catch (err: any) {
            console.error('❌ Failed to load cart:', err);
        } finally { setLoading(false) }
    }

    const removeItem = async (id: number) => {
        try {
            await api.delete(`/api/cart/${id}/`)
            // refresh local view and redux
            await fetchCartItems()
            try { dispatch(fetchCart() as any) } catch { }
        } catch (err) {
            console.error('❌ Failed to remove item:', err);
        }
    };

    const subtotal = Array.isArray(cartItems)
        ? cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
        : 0;

    return (
        <Dialog open={open} onClose={setOpen} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/50 transition-opacity" />
            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <DialogPanel className="drawer-responsive pointer-events-auto transform transition-all" style={{ background: 'var(--surface)' }}>
                            <div className="flex h-full flex-col overflow-y-auto">
                                {/* Header */}
                                <div className="flex items-start justify-between px-4 sm:px-6 py-4 border-b border-theme">
                                    <DialogTitle className="text-lg sm:text-xl font-semibold text-default">🛒 Your Cart</DialogTitle>
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition p-1"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Cart Items */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                                    {loading ? (
                                        <div className="text-center py-8 text-muted">
                                            <div className="animate-spin inline-block">⏳</div> Loading...
                                        </div>
                                    ) : !Array.isArray(cartItems) || cartItems.length === 0 ? (
                                        <div className="text-center py-8 text-muted">
                                            <div className="text-2xl mb-2">🛍️</div>
                                            <p>Your cart is empty.</p>
                                        </div>
                                    ) : (
                                        <ul className="space-y-4 divide-y divide-card">
                                            {cartItems.map((item) => (
                                                <li key={item.id} className="flex gap-3 sm:gap-4 py-4">
                                                    <img
                                                        src={item.product?.image || "/placeholder.png"}
                                                        alt={item.product?.name || "Product"}
                                                        className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg border border-card object-cover flex-shrink-0"
                                                    />
                                                    <div className="flex-1 flex flex-col min-w-0">
                                                        <h3 className="text-sm sm:text-base font-semibold text-default truncate">{item.product?.name}</h3>
                                                        <div className="flex justify-between items-start mt-1">
                                                            <div>
                                                                <p className="text-xs sm:text-sm text-muted">Qty: <span className="font-medium">{item.quantity}</span></p>
                                                                <p className="text-sm sm:text-base font-bold text-default mt-1">${(item.price * item.quantity).toFixed(2)}</p>
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
                        </DialogPanel>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

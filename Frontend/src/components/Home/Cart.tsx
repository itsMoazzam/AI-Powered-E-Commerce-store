'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000/api";

export default function CartDrawer({ open, setOpen }: { open: boolean; setOpen: (val: boolean) => void }) {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('access');

    useEffect(() => {
        if (open) fetchCart();
    }, [open]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/cart/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // ✅ Handle both list or object response
            if (Array.isArray(res.data)) {
                setCartItems(res.data);
            } else if (res.data.items) {
                setCartItems(res.data.items);
            } else {
                setCartItems([]);
            }
        } catch (err: any) {
            console.error('❌ Failed to load cart:', err);
            if (err.response?.status === 401) {
                alert("Please log in again — session expired.");
                localStorage.removeItem("access");
                window.location.href = "/auth/login";
            }
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (id: number) => {
        try {
            await axios.delete(`${API_BASE}/cart/${id}/remove/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCartItems((prev) => prev.filter((item) => item.id !== id));
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
                        <DialogPanel className="pointer-events-auto w-screen max-w-md transform transition-all bg-white shadow-2xl">
                            <div className="flex h-full flex-col overflow-y-auto">
                                {/* Header */}
                                <div className="flex items-start justify-between px-6 py-4 border-b">
                                    <DialogTitle className="text-lg font-semibold text-gray-800">🛒 Your Cart</DialogTitle>
                                    <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-800">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Cart Items */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    {loading ? (
                                        <p className="text-center text-gray-500">Loading...</p>
                                    ) : !Array.isArray(cartItems) || cartItems.length === 0 ? (
                                        <p className="text-center text-gray-500">Your cart is empty.</p>
                                    ) : (
                                        <ul className="divide-y divide-gray-200">
                                            {cartItems.map((item) => (
                                                <li key={item.id} className="flex py-6">
                                                    <img
                                                        src={item.product?.image || "/placeholder.png"}
                                                        alt={item.product?.name || "Product"}
                                                        className="h-24 w-24 rounded-md border object-cover"
                                                    />
                                                    <div className="ml-4 flex flex-1 flex-col">
                                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                                            <h3>{item.product?.name}</h3>
                                                            <p>${item.price}</p>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="mt-auto text-sm text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="border-t border-gray-200 px-6 py-4">
                                    <div className="flex justify-between text-base font-semibold text-gray-900">
                                        <p>Subtotal</p>
                                        <p>${subtotal.toFixed(2)}</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Shipping and taxes calculated at checkout.
                                    </p>
                                    <button
                                        disabled={!cartItems.length}
                                        className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-white hover:bg-indigo-700 disabled:bg-gray-400"
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

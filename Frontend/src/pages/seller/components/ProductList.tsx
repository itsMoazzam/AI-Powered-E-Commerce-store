// src/pages/seller/components/ProductList.tsx
import { useEffect, useState } from "react"
import { Eye, Edit3 } from "lucide-react"
import Product3DPreview from "./Product3DPreview"
import api from "../../../lib/api"
import ProductForm from "./ProductForm"
import ProductEditModal from "./ProductEditModal"

interface Product {
    id: number
    title: string
    price: number | string
    thumbnail?: string
    image?: string
    model_3d?: string
}

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([])
    const [preview, setPreview] = useState<Product | null>(null)
    const [busyId, setBusyId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [editProduct, setEditProduct] = useState<Product | null>(null)

    async function fetchProducts() {
        try {
            setLoading(true)
            const res = await api.get("/api/seller/products/")
            setProducts(res.data)
        } catch (err) {
            console.error("❌ Failed to load products:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    async function handleUpdate(id: number, formData: FormData) {
        try {
            setBusyId(id)
            const res = await api.put(`/api/seller/products/${id}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            setProducts(products.map(p => (p.id === id ? res.data : p)))
            setEditProduct(null)
        } catch (err) {
            console.error("❌ Update failed:", err)
            alert("Failed to update product.")
        } finally {
            setBusyId(null)
        }
    }

    async function removeProduct(id: number) {
        if (!confirm("Delete this product? This action cannot be undone.")) return
        try {
            setBusyId(id)
            await api.delete(`/api/seller/products/${id}/`)
            setProducts(products.filter(p => p.id !== id))
        } catch (err) {
            console.error("❌ Delete failed:", err)
            alert("Failed to delete product. Please try again.")
        } finally {
            setBusyId(null)
        }
    }

    if (loading) {
        return <div className="text-center py-10 text-zinc-500">Loading products...</div>
    }
    return (
        <section className="grid gap-4">
            {products.length === 0 ? (
                <div className="text-center text-zinc-500 py-10 bg-white rounded-xl border">
                    No products found.
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((p) => (
                        <div
                            key={p.id}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 transition hover:shadow-md"
                        >
                            <div className="relative">

                                <img
                                    src={p.thumbnail || `/placeholder.jpg`}

                                    alt={p.title}
                                    // onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                                    className="w-full h-44 object-cover rounded-md"
                                />
                                {p.model_3d && (
                                    <span className="absolute top-3 right-3 bg-indigo-600 text-white px-2 py-1 rounded-md text-xs">
                                        3D
                                    </span>
                                )}
                            </div>

                            <div className="mt-3 flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="font-semibold text-zinc-900 ">{p.title}</div>
                                    <div className="text-sm text-zinc-500">
                                        ${typeof p.price === "number"
                                            ? p.price.toFixed(2)
                                            : Number(p.price || 0).toFixed(2)}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        onClick={() => setEditProduct(p)}
                                        className="text-sm px-3 py-1 rounded-md border text-blue-600 hover:bg-blue-50 transition border-blue-200 flex items-center gap-1"
                                    >
                                        <Edit3 size={14} /> Edit
                                    </button>

                                    <button
                                        onClick={() => removeProduct(p.id)}
                                        disabled={busyId === p.id}
                                        className={`text-sm px-3 py-1 rounded-md border text-red-600 hover:bg-red-50 transition ${busyId === p.id
                                            ? "border-gray-300 cursor-not-allowed opacity-70"
                                            : "border-red-200"
                                            }`}
                                    >
                                        {busyId === p.id ? "Deleting..." : "Delete"}
                                    </button>

                                    {p.model_3d && (
                                        <button
                                            onClick={() => setPreview(p)}
                                            className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-1"
                                        >
                                            <Eye size={14} /> Preview 3D
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 🔵 3D Preview Modal */}
            {preview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-lg animate-fadeIn">
                        <div className="p-4 flex items-center justify-between border-b">
                            <div className="font-semibold text-gray-700 capitalize">{preview.title} — 3D Preview</div>
                            <button
                                onClick={() => setPreview(null)}
                                className="text-sm px-3 py-1 text-gray-500 bg-zinc-100 rounded-md hover:bg-zinc-200"
                            >
                                Close
                            </button>
                        </div>
                        <div className="p-6">
                            <Product3DPreview url={preview.model_3d!} />
                        </div>
                    </div>
                </div>
            )}

            {/* 🟢 Edit Modal (fixed placement) */}
            {editProduct && (
                <ProductEditModal onClose={() => setEditProduct(null)}>
                    <ProductForm
                        initialData={editProduct}
                        onCreated={(formData) => handleUpdate(editProduct.id, formData)}
                    />
                </ProductEditModal>
            )}
        </section>
    )
}

// src/pages/seller/components/ProductList.tsx
import { useState } from "react"
import { Trash2, Eye } from "lucide-react"
import Product3DPreview from "./Product3DPreview"
import api from "../../../lib/api"

export default function ProductList({ products = [], onEdit, onDelete, refresh }: any) {
    const [preview, setPreview] = useState<any | null>(null)
    const [busyId, setBusyId] = useState<number | string | null>(null)

    async function removeProduct(id: number | string) {
        if (!confirm("Delete this product? This action cannot be undone.")) return
        try {
            setBusyId(id)
            // uncomment when backend ready:
            // await api.delete(`/api/seller/products/${id}/`)
            onDelete(id)
        } catch (err) {
            console.error("Delete failed", err)
            alert("Delete failed")
        } finally {
            setBusyId(null)
        }
    }

    return (
        <section className="grid gap-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p: any) => (
                    <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
                        <div className="relative">
                            <img src={p.thumbnail || p.image} className="w-full h-44 object-cover rounded-md" />
                            {p.model_3d && (
                                <span className="absolute top-3 right-3 bg-indigo-600 text-white px-2 py-1 rounded-md text-xs">3D</span>
                            )}
                        </div>

                        <div className="mt-3 flex items-start justify-between gap-3">
                            <div>
                                <div className="font-semibold text-zinc-900">{p.title}</div>
                                <div className="text-sm text-zinc-500">${Number(p.price).toFixed(2)}</div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <button
                                    onClick={() => onEdit && onEdit(p)}
                                    className="text-sm px-3 py-1 rounded-md border border-zinc-200 hover:bg-zinc-100"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => removeProduct(p.id)}
                                    className="text-sm px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                >
                                    {busyId === p.id ? "Deleting..." : "Delete"}
                                </button>
                                {p.model_3d && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <button onClick={() => setPreview(p)} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                            <Eye size={14} /> Preview 3D
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {preview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden">
                        <div className="p-4 flex items-center justify-between border-b">
                            <div className="font-semibold">{preview.title} — 3D Preview</div>
                            <button onClick={() => setPreview(null)} className="text-sm px-3 py-1">Close</button>
                        </div>
                        <div className="p-6">
                            <Product3DPreview url={preview.model_3d} />
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

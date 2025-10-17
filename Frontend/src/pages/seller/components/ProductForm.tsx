import { useState } from "react"
import api from "../../../lib/api"
import { Upload, Loader2 } from "lucide-react"

export default function ProductForm({ onCreated }: { onCreated: (p: any) => void }) {
    const [form, setForm] = useState({ title: "", price: "", description: "" })
    const [image, setImage] = useState<File | null>(null)
    const [model3d, setModel3d] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))
        if (image) fd.append("thumbnail", image)
        if (model3d) fd.append("model_3d", model3d)

        try {
            const { data } = await api.post("/api/seller/products/", fd)
            onCreated(data)
            alert("✅ Product created successfully!")
            setForm({ title: "", price: "", description: "" })
            setImage(null)
            setModel3d(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={submit}
            className="bg-white rounded-2xl p-6 shadow-sm space-y-4 max-w-xl"
        >
            <h3 className="text-lg font-semibold text-zinc-800">Add New Product</h3>

            <input
                type="text"
                placeholder="Product title"
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
            />
            <input
                type="number"
                placeholder="Price"
                className="input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
            />
            <textarea
                placeholder="Description"
                className="input"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="grid gap-3 md:grid-cols-2">
                <div>
                    <label className="text-sm text-zinc-600">Thumbnail</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                    />
                </div>
                <div>
                    <label className="text-sm text-zinc-600">3D Model (.glb)</label>
                    <input
                        type="file"
                        accept=".glb,.gltf"
                        onChange={(e) => setModel3d(e.target.files?.[0] || null)}
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={16} />}
                {loading ? "Uploading..." : "Add Product"}
            </button>
        </form>
    )
}

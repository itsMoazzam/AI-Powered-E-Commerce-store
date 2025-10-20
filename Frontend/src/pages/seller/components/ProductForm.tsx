import { useState } from "react"
import api from "../../../lib/api"
import { Upload, Loader2, Plus, Trash } from "lucide-react"

interface ProductFormProps {
    onCreated: (p: any) => void
}

export default function ProductForm({ onCreated }: ProductFormProps) {
    const [form, setForm] = useState({
        title: "",
        price: "",
        description: "",
        category: "",
        stock: "",
        discount: "",
    })
    const [image, setImage] = useState<File | null>(null)
    const [model3d, setModel3d] = useState<File | null>(null)
    const [extraImages, setExtraImages] = useState<File[]>([])
    const [videos, setVideos] = useState<File[]>([])
    const [loading, setLoading] = useState(false)

    // 🔹 Dynamic custom fields (optional product features)
    const [customFields, setCustomFields] = useState([{ key: "", value: "" }])

    const addCustomField = () =>
        setCustomFields([...customFields, { key: "", value: "" }])

    const removeCustomField = (index: number) => {
        setCustomFields(customFields.filter((_, i) => i !== index))
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        const fd = new FormData()

        // Basic info
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))

        // Main uploads
        if (image) fd.append("thumbnail", image)
        if (model3d) fd.append("model_3d", model3d)

        // Extra images
        extraImages.forEach((img) => fd.append("images", img))
        videos.forEach((vid) => fd.append("videos", vid))

        // Custom attributes
        customFields.forEach((f, i) => {
            if (f.key && f.value) {
                fd.append(`attributes[${i}][key]`, f.key)
                fd.append(`attributes[${i}][value]`, f.value)
            }
        })

        try {
            const { data } = await api.post("/api/seller/products/", fd)
            onCreated(data)
            alert("✅ Product created successfully!")
            setForm({
                title: "",
                price: "",
                description: "",
                category: "",
                stock: "",
                discount: "",
            })
            setImage(null)
            setModel3d(null)
            setExtraImages([])
            setVideos([])
            setCustomFields([{ key: "", value: "" }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={submit}
            className="bg-white rounded-2xl p-6 shadow-sm space-y-5 max-w-3xl mx-auto"
        >
            <h3 className="text-xl font-semibold text-zinc-800">
                Add New Product
            </h3>

            {/* 🔹 Basic Fields */}
            <div className="grid gap-4 md:grid-cols-2">
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
                <input
                    type="text"
                    placeholder="Category"
                    className="input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Stock Quantity"
                    className="input"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Discount (%)"
                    className="input"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                />
            </div>

            {/* 🔹 Description */}
            <textarea
                placeholder="Product description"
                className="input"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            {/* 🔹 File Uploads */}
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="text-sm text-zinc-600">Thumbnail</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                    />
                </div>

                <div>
                    <label className="text-sm text-zinc-600">3D Model (.glb/.gltf)</label>
                    <input
                        type="file"
                        accept=".glb,.gltf"
                        onChange={(e) => setModel3d(e.target.files?.[0] || null)}
                    />
                </div>
            </div>

            {/* 🔹 Extra Images */}
            <div>
                <label className="text-sm text-zinc-600">Extra Images</label>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                        setExtraImages(Array.from(e.target.files || []))
                    }
                />
            </div>

            {/* 🔹 Videos */}
            <div>
                <label className="text-sm text-zinc-600">Product Videos</label>
                <input
                    type="file"
                    multiple
                    accept="video/mp4,video/webm"
                    onChange={(e) => setVideos(Array.from(e.target.files || []))}
                />
            </div>

            {/* 🔹 Custom Attribute Fields */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm text-zinc-600 font-medium">
                        Additional Attributes
                    </label>
                    <button
                        type="button"
                        onClick={addCustomField}
                        className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:underline"
                    >
                        <Plus size={14} /> Add Field
                    </button>
                </div>

                {customFields.map((field, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <input
                            type="text"
                            placeholder="Key (e.g. Material)"
                            value={field.key}
                            onChange={(e) => {
                                const updated = [...customFields]
                                updated[index].key = e.target.value
                                setCustomFields(updated)
                            }}
                            className="input flex-1"
                        />
                        <input
                            type="text"
                            placeholder="Value (e.g. Cotton)"
                            value={field.value}
                            onChange={(e) => {
                                const updated = [...customFields]
                                updated[index].value = e.target.value
                                setCustomFields(updated)
                            }}
                            className="input flex-1"
                        />
                        <button
                            type="button"
                            onClick={() => removeCustomField(index)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* 🔹 Submit */}
            <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                    </>
                ) : (
                    <>
                        <Upload size={16} /> Add Product
                    </>
                )}
            </button>
        </form>
    )
}

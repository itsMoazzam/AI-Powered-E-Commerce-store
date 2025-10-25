import { useState } from "react"
import api from "../../../lib/api"
import { Loader2, Plus, Trash, ImagePlus } from "lucide-react"
import CategorySelector from "../../../components/Category"

interface ProductFormProps {
    onCreated: (p: any) => void
}

export default function ProductForm({ onCreated }: ProductFormProps) {
    const [form, setForm] = useState({
        title: "",
        price: "",
        description: "",
        category: 0,
        stock: 0,
        discount: 0,
    })

    const [thumbnail, setThumbnail] = useState<File | null>(null)
    const [model3d, setModel3d] = useState<File | null>(null)
    const [images, setImages] = useState<File[]>([])
    const [videos, setVideos] = useState<File[]>([])
    const [customFields, setCustomFields] = useState([{ key: "", value: "" }])
    const [loading, setLoading] = useState(false)

    const addCustomField = () =>
        setCustomFields([...customFields, { key: "", value: "" }])

    const removeCustomField = (index: number) =>
        setCustomFields(customFields.filter((_, i) => i !== index))

    const addImageSlot = () => setImages([...images, null as unknown as File])

    const removeImage = (index: number) =>
        setImages(images.filter((_, i) => i !== index))

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const fd = new FormData()
        fd.append("title", form.title)
        fd.append("price", form.price.toString())
        fd.append("description", form.description)
        fd.append("stock", form.stock.toString())
        fd.append("discount", form.discount.toString())
        if (form.category) fd.append("category", String(form.category))
        if (thumbnail) fd.append("thumbnail", thumbnail)
        if (model3d) fd.append("model_3d", model3d)
        images.forEach((img) => img && fd.append("images", img))
        videos.forEach((vid) => vid && fd.append("videos", vid))
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
                category: 0,
                stock: 0,
                discount: 0,
            })
            setThumbnail(null)
            setModel3d(null)
            setImages([])
            setVideos([])
            setCustomFields([{ key: "", value: "" }])
        } catch (error) {
            console.error("❌ Product creation failed:", error)
            alert("Product creation failed — check category or authentication.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={submit}
            className="bg-white rounded-2xl p-6 shadow-sm space-y-6 max-w-3xl mx-auto"
        >
            <h3 className="text-xl font-semibold text-zinc-800">
                Add New Product
            </h3>

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
                <CategorySelector
                    selectedId={form.category}
                    onSelect={(id: number) => setForm({ ...form, category: id })}
                />
                <input
                    type="number"
                    placeholder="Stock quantity"
                    className="input"
                    value={form.stock || ""}
                    onChange={(e) =>
                        setForm({ ...form, stock: Number(e.target.value) })
                    }
                />
                <input
                    type="number"
                    placeholder="Discount (%)"
                    className="input"
                    value={form.discount || ""}
                    onChange={(e) =>
                        setForm({ ...form, discount: Number(e.target.value) })
                    }
                />
            </div>

            <textarea
                placeholder="Product description"
                className="input w-full"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            {/* File Uploads */}
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="text-sm font-medium text-zinc-700">
                        Thumbnail
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                        className="mt-1 block text-sm text-zinc-600"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-zinc-700">
                        3D Model (.glb / .gltf)
                    </label>
                    <input
                        type="file"
                        accept=".glb,.gltf"
                        onChange={(e) => setModel3d(e.target.files?.[0] || null)}
                        className="mt-1 block text-sm text-zinc-600"
                    />
                </div>
            </div>

            {/* ✅ Multiple Images */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-700">
                        Additional Images
                    </label>
                    <button
                        type="button"
                        onClick={addImageSlot}
                        className="text-indigo-600 text-sm flex items-center gap-1 hover:underline"
                    >
                        <ImagePlus size={16} /> Add More
                    </button>
                </div>

                {images.map((_, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <input
                            type="file"
                            accept="image/*"
                            className="input flex-1"
                            onChange={(e) => {
                                const copy = [...images]
                                copy[i] = e.target.files?.[0] || null
                                setImages(copy)
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Videos */}
            <div>
                <label className="text-sm font-medium text-zinc-700">
                    Product Videos
                </label>
                <input
                    type="file"
                    multiple
                    accept="video/mp4,video/webm"
                    onChange={(e) => setVideos(Array.from(e.target.files || []))}
                    className="mt-1 block text-sm text-zinc-600"
                />
            </div>

            {/* Attributes */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-700">
                        Custom Attributes
                    </label>
                    <button
                        type="button"
                        onClick={addCustomField}
                        className="text-indigo-600 text-sm flex items-center gap-1 hover:underline"
                    >
                        <Plus size={14} /> Add Field
                    </button>
                </div>

                {customFields.map((f, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <input
                            type="text"
                            placeholder="Key (e.g. Color)"
                            className="input flex-1"
                            value={f.key}
                            onChange={(e) => {
                                const copy = [...customFields]
                                copy[i].key = e.target.value
                                setCustomFields(copy)
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Value (e.g. Red)"
                            className="input flex-1"
                            value={f.value}
                            onChange={(e) => {
                                const copy = [...customFields]
                                copy[i].value = e.target.value
                                setCustomFields(copy)
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => removeCustomField(i)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-70"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Product"}
            </button>
        </form>
    )
}

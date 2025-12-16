import { useState, useEffect } from "react"
import api from "../../../lib/api"
import { Loader2, Plus, Trash, ImagePlus } from "lucide-react"
import CategorySelector from "../../../components/Category"

interface ProductFormProps {
    onCreated?: (p: any) => void
    onUpdated?: (p: any) => void
    onCancel?: () => void
    product?: any
    initialData?: any
}

export default function ProductForm({ onCreated, onUpdated, onCancel, product, initialData }: ProductFormProps) {
    const [form, setForm] = useState({
        title: "",
        price: "",
        description: "",
        category: 0,
        stock: 0,
        discount: 0,
    })

    const [thumbnail, setThumbnail] = useState<File | null>(null)
    const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null)
    const [removeThumbnail, setRemoveThumbnail] = useState(false)
    const [model3d, setModel3d] = useState<File | null>(null)

    // 🔥 Each image now includes extra metadata
    const [images, setImages] = useState<
        { file: File | null; alt_text: string; is_primary: boolean; url?: string; removed?: boolean }[]
    >([])

    const [videos, setVideos] = useState<File[]>([])
    const [customFields, setCustomFields] = useState([{ key: "", value: "" }])
    const [loading, setLoading] = useState(false)

    // support edit mode: product or initialData can supply existing values
    const editing = !!(product || initialData)
    const existing = product || initialData

    useEffect(() => {
        if (existing) {
            setForm({
                title: existing.title || "",
                price: String(existing.price ?? ""),
                description: existing.description || "",
                category: existing.category || 0,
                stock: existing.stock_qty ?? existing.stock ?? 0,
                discount: existing.discount ?? 0,
            })
            // Prefill thumbnail and images if available
            setExistingThumbnailUrl(existing.thumbnail || null)
            if (Array.isArray(existing.images) && existing.images.length > 0) {
                setImages(existing.images.map((img: any, idx: number) => ({
                    file: null,
                    alt_text: img.alt_text || "",
                    is_primary: !!img.is_primary || idx === 0,
                    url: img.url || img.image || "",
                    removed: false,
                })))
            } else if (existing.image || (existing.images_urls && Array.isArray(existing.images_urls))) {
                const arr: any[] = []
                if (existing.image) arr.push({ url: existing.image, alt_text: "", is_primary: true, file: null, removed: false })
                if (existing.images_urls) arr.push(...existing.images_urls.map((u: string) => ({ url: u, alt_text: "", is_primary: false, file: null, removed: false })))
                if (arr.length) setImages(arr)
            }
        }
    }, [existing])

    const addImageSlot = () =>
        setImages([
            ...images,
            { file: null, alt_text: "", is_primary: images.length === 0 }, // first one default primary
        ])

    const removeImage = (index: number) =>
        setImages(images.filter((_, i) => i !== index))

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const fd = new FormData()
        fd.append("title", form.title)
        fd.append("price", form.price.toString())
        fd.append("description", form.description)
        fd.append("stock_qty", form.stock.toString())
        fd.append("discount", form.discount.toString())
        if (form.category) fd.append("category", String(form.category))
        if (thumbnail) fd.append("thumbnail", thumbnail)
        if (model3d) fd.append("model_3d", model3d)

        // ✅ Append images as flat fields matching serializer's `images` key
        images.forEach((img) => {
            if (img.file) {
                fd.append("images", img.file)
                fd.append("alt_texts", img.alt_text)
                fd.append("is_primary", String(img.is_primary))
            }
        })

        // Optional: handle videos or custom fields
        videos.forEach((vid) => vid && fd.append("videos", vid))
        customFields.forEach((f, i) => {
            if (f.key && f.value) {
                fd.append(`attributes[${i}][key]`, f.key)
                fd.append(`attributes[${i}][value]`, f.value)
            }
        })

        // Include removal flags for existing images (if user marked them)
        images.forEach((img) => {
            if (img.url && img.removed) fd.append("remove_images", img.url)
        })

        // Include thumbnail removal flag
        if (removeThumbnail) fd.append("remove_thumbnail", "true")

        try {
            if (editing && existing?.id) {
                const { data: updated } = await api.put(`/api/seller/products/${existing.id}/`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                if (onUpdated) onUpdated(updated)
                alert("✅ Product updated successfully!")
            } else {
                const { data: created } = await api.post("/api/seller/products/", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                if (onCreated) onCreated(created)
                alert("✅ Product created successfully!")

                // Reset create form
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
            }
        } catch (error) {
            console.error("❌ Product operation failed:", error)
            alert("Product operation failed — check category or authentication.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={submit}
            className="bg-white rounded-2xl p-6 shadow-sm space-y-6 max-w-3xl mx-auto"
        >
            <h3 className="text-xl font-semibold text-zinc-800">{editing ? 'Edit Product' : 'Add New Product'}</h3>

            {/* Core Fields */}
            <div className="grid gap-4 md:grid-cols-2">
                <input
                    type="text"
                    placeholder="Product title"
                    className="input-field"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Price"
                    className="input-field"
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
                    className="input-field h-10"
                    value={form.stock || ""}
                    onChange={(e) =>
                        setForm({ ...form, stock: Number(e.target.value) })
                    }
                />
                <input
                    type="number"
                    placeholder="Discount (%)"
                    className="input-field"
                    value={form.discount || ""}
                    onChange={(e) =>
                        setForm({ ...form, discount: Number(e.target.value) })
                    }
                />
            </div>

            <textarea
                placeholder="Product description"
                className="input-field w-full"
                rows={4}
                value={form.description}
                onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                }
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
                        onChange={(e) => {
                            setThumbnail(e.target.files?.[0] || null)
                            setRemoveThumbnail(false)
                        }}
                        className="mt-1 block text-sm text-zinc-600"
                    />

                    {existingThumbnailUrl && !thumbnail && (
                        <div className="mt-2 flex items-center gap-3">
                            <img src={existingThumbnailUrl} alt="thumbnail" className="w-20 h-12 object-cover rounded" />
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={removeThumbnail} onChange={(e) => setRemoveThumbnail(e.target.checked)} /> Remove thumbnail
                            </label>
                        </div>
                    )}
                    {thumbnail && (
                        <div className="mt-2">
                            <img src={URL.createObjectURL(thumbnail)} alt="new thumbnail" className="w-28 h-16 object-cover rounded" />
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium text-zinc-700">
                        3D Model (.glb / .gltf)
                    </label>
                    <input
                        type="file"
                        accept=".glb,.gltf"
                        onChange={(e) =>
                            setModel3d(e.target.files?.[0] || null)
                        }
                        className="mt-1 block text-sm text-zinc-600"
                    />
                </div>
            </div>

            {/* ✅ Multiple Images with metadata */}
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

                {images.map((img, i) => (
                    <div key={`image-${i}`} className="grid md:grid-cols-3 gap-2 items-center">
                        {img.url && !img.file ? (
                            <div className="flex items-center gap-3">
                                <img src={img.url} alt={`img-${i}`} className="w-28 h-20 object-cover rounded" />
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={!!img.removed} onChange={(e) => {
                                        const copy = [...images]
                                        copy[i].removed = e.target.checked
                                        setImages(copy)
                                    }} /> Remove
                                </label>
                            </div>
                        ) : (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const copy = [...images]
                                    copy[i].file = e.target.files?.[0] || null
                                    setImages(copy)
                                }}
                                className="input-field"
                            />
                        )}

                        <input
                            type="text"
                            placeholder="Alt text"
                            value={img.alt_text}
                            onChange={(e) => {
                                const copy = [...images]
                                copy[i].alt_text = e.target.value
                                setImages(copy)
                            }}
                            className="input-field"
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={img.is_primary}
                                onChange={(e) => {
                                    const copy = images.map((im, idx) => ({
                                        ...im,
                                        is_primary:
                                            idx === i ? e.target.checked : false,
                                    }))
                                    setImages(copy)
                                }}
                            />
                            Primary
                        </label>
                        <button
                            type="button"
                            onClick={() => setImages(images.filter((_, j) => j !== i))}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Custom Attributes */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-700">
                        Custom Attributes
                    </label>
                    <button
                        type="button"
                        onClick={() =>
                            setCustomFields([...customFields, { key: "", value: "" }])
                        }
                        className="text-indigo-600 text-sm flex items-center gap-1 hover:underline"
                    >
                        <Plus size={14} /> Add Field
                    </button>
                </div>

                {customFields.map((f, i) => (
                    <div key={`field-${i}`} className="flex gap-2 items-center">
                        <input
                            type="text"
                            placeholder="Key (e.g. Color)"
                            className="input-field flex-1"
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
                            className="input-field flex-1"
                            value={f.value}
                            onChange={(e) => {
                                const copy = [...customFields]
                                copy[i].value = e.target.value
                                setCustomFields(copy)
                            }}
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setCustomFields(customFields.filter((_, j) => j !== i))
                            }
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-70"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        editing ? 'Update Product' : 'Add Product'
                    )}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn-outline flex-1 py-3 rounded-lg">Cancel</button>
                )}
            </div>
        </form>
    )
}

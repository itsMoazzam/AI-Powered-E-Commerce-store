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
    const [prefetchModel3dUrl, setPrefetchModel3dUrl] = useState<string | null>(null)
    const [prefetchVideos, setPrefetchVideos] = useState<string[]>([])
    const [customFields, setCustomFields] = useState([{ key: "", value: "" }])
    const [loading, setLoading] = useState(false)

    // support edit mode: product or initialData can supply existing values
    const editing = !!(product || initialData)
    const existing = product || initialData

    useEffect(() => {
        if (existing) {
            // Ensure category is always a number (ID), not a string (name)
            let categoryValue = existing.category || 0
            if (typeof categoryValue === 'string') {
                // If it's a string, try to convert to number if it's numeric
                const parsed = parseInt(categoryValue, 10)
                categoryValue = isNaN(parsed) ? 0 : parsed
            }
            
            setForm({
                title: existing.title || "",
                price: String(existing.price ?? ""),
                description: existing.description || "",
                category: categoryValue,
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

            // Fallback: try other common gallery fields and include thumbnail as an image slot so edit UI always shows media
            (function includeAdditionalImageSources() {
                const arr: any[] = []

                const pushUrl = (u: string | null | undefined, idx = 0) => {
                    if (!u) return
                    arr.push({ url: u, alt_text: '', is_primary: arr.length === 0, file: null, removed: false })
                }

                // common alternative fields that backends sometimes use
                if (existing.media && Array.isArray((existing as any).media)) {
                    (existing as any).media.forEach((m: any) => pushUrl(typeof m === 'string' ? m : m.url))
                }
                if (existing.gallery && Array.isArray((existing as any).gallery)) {
                    (existing as any).gallery.forEach((m: any) => pushUrl(typeof m === 'string' ? m : m.url))
                }
                if (existing.photos && Array.isArray((existing as any).photos)) {
                    (existing as any).photos.forEach((m: any) => pushUrl(typeof m === 'string' ? m : m.url))
                }
                if (existing.photo_urls && Array.isArray((existing as any).photo_urls)) {
                    (existing as any).photo_urls.forEach((u: string) => pushUrl(u))
                }

                // always include thumbnail as first image if present and nothing else exists
                if (arr.length === 0 && (existing.thumbnail || existing.image)) {
                    pushUrl(existing.thumbnail || existing.image)
                }

                if (arr.length && images.length === 0) {
                    setImages(arr)
                }
            })()

            // Normalize custom attributes from common fields (attributes, specs, custom_attributes, meta, etc.)
            const normalizeAttributes = (attrs: any): { key: string; value: string }[] => {
                if (!attrs) return []
                try {
                    let data = attrs
                    if (typeof attrs === 'string') data = JSON.parse(attrs)
                    if (Array.isArray(data)) {
                        return data.map((item: any) => {
                            if (typeof item === 'string') {
                                const [k, v] = item.split(":").map((s: string) => s.trim())
                                return { key: k || item, value: v || "" }
                            }
                            if (typeof item === 'object' && item !== null) {
                                const key = item.key ?? item.name ?? item.label ?? Object.keys(item)[0]
                                const value = item.value ?? item.val ?? item.v ?? item[key] ?? ""
                                return { key: String(key), value: String(value ?? "") }
                            }
                            return { key: String(item), value: "" }
                        }).filter(Boolean)
                    }
                    if (typeof data === 'object' && data !== null) {
                        return Object.entries(data).map(([k, v]) => ({ key: k, value: v === null || v === undefined ? '' : String(v) }))
                    }
                } catch (err) {
                    console.warn('Failed to parse attributes for edit form', err)
                }
                return []
            }

            const attrs = normalizeAttributes((existing as any).attributes || (existing as any).specs || (existing as any).specifications || (existing as any).custom_attributes || (existing as any).custom_attributes_json || (existing as any).meta || (existing as any).metadata || {})

            if (attrs && attrs.length > 0) {
                setCustomFields(attrs.map(a => ({ key: a.key, value: a.value })))
            }
        }
    }, [existing])

    // If editing but the list-provided `existing` object lacks images/attributes, fetch full details

    useEffect(() => {
        let mounted = true
        // If the list item only provides a single/top-level image (or none), fetch full product details
        // so the edit form can show the full gallery. We consider 2+ images as 'has gallery already'.
        const existingImageCount = (() => {
            if (!existing) return 0
            if (Array.isArray((existing as any).images)) return (existing as any).images.length
            if (Array.isArray((existing as any).images_urls)) return (existing as any).images_urls.length
            if ((existing as any).image || (existing as any).thumbnail) return 1
            return 0
        })()
        const needsFetch = editing && existing && (existing as any).id && existingImageCount < 2
        if (!needsFetch) return

            ; (async () => {
                try {
                    // Try public product endpoint first (sometimes contains richer media/attributes)
                    let productData: any = null
                    try {
                        const publicRes = await api.get(`/api/products/${(existing as any).id}/`)
                        productData = publicRes.data
                    } catch (e) {
                        // ignore — try seller endpoint next
                    }

                    if (!productData) {
                        try {
                            const sellerRes = await api.get(`/api/seller/products/${(existing as any).id}/`)
                            productData = sellerRes.data
                        } catch (e) {
                            console.warn('Product detail fetch failed for edit mode', e)
                        }
                    }

                    if (!mounted || !productData) return

                    const data = productData

                    // Merge fetched data into form fields (preserve existing values when missing)
                    // Ensure category is always a number (ID), not a string (name)
                    let categoryValue = data.category ?? 0
                    if (typeof categoryValue === 'string') {
                        const parsed = parseInt(categoryValue, 10)
                        categoryValue = isNaN(parsed) ? 0 : parsed
                    }
                    
                    setForm((prev) => ({
                        ...prev,
                        title: data.title ?? prev.title,
                        price: String(data.price ?? prev.price ?? ""),
                        description: data.description ?? prev.description,
                        category: categoryValue,
                        stock: data.stock_qty ?? data.stock ?? prev.stock,
                        discount: data.discount ?? prev.discount,
                    }))

                    // Thumbnail
                    setExistingThumbnailUrl(data.thumbnail || data.image || existing.thumbnail || null)

                    // Model 3D detection (like ProductDetail)
                    const detect3DModel = (d: any): string | null => {
                        const allUrls: string[] = []
                        if (d.model_3d) allUrls.push(d.model_3d)
                        if (d.model3d) allUrls.push(d.model3d)
                        if (d.three_d_model) allUrls.push(d.three_d_model)
                        if (Array.isArray(d.images)) allUrls.push(...d.images)
                        if (Array.isArray(d.videos)) allUrls.push(...d.videos.map((v: any) => v.video))
                        const match = allUrls.find((url) => typeof url === "string" && url.match(/\.(glb|gltf)$/i))
                        return match || null
                    }

                    const m3 = detect3DModel(data)
                    if (m3) setPrefetchModel3dUrl(m3)
                    // Videos
                    if (Array.isArray(data.videos)) setPrefetchVideos(data.videos.map((v: any) => v.preview_image || v.video).filter(Boolean))

                    // assemble images robustly from a variety of shapes
                    const imgs: any[] = []
                    if (Array.isArray(data.images) && data.images.length > 0) {
                        data.images.forEach((img: any, idx: number) => {
                            if (typeof img === 'string') imgs.push({ url: img, alt_text: '', is_primary: idx === 0, file: null, removed: false })
                            else if (img && typeof img === 'object') imgs.push({ url: img.url || img.image || img.path || '', alt_text: img.alt_text || img.alt || '', is_primary: !!img.is_primary || idx === 0, file: null, removed: false })
                        })
                    }
                    if (data.image && imgs.length === 0) imgs.push({ url: data.image, alt_text: '', is_primary: true, file: null, removed: false })
                    if (data.images_urls && Array.isArray(data.images_urls)) imgs.push(...data.images_urls.map((u: string) => ({ url: u, alt_text: '', is_primary: false, file: null, removed: false })))

                    // ensure at least thumbnail is present
                    if (imgs.length === 0 && (data.thumbnail || data.image || existing.thumbnail)) {
                        const u = data.thumbnail || data.image || existing.thumbnail
                        imgs.push({ url: u, alt_text: '', is_primary: true, file: null, removed: false })
                    }

                    if (imgs.length) setImages(imgs)

                    // Normalize attributes from fetched details — same approach as ProductDetail
                    const normalizeAttributes = (attrs: any): { key: string; value: string }[] => {
                        if (!attrs) return []
                        try {
                            let d = attrs
                            if (typeof attrs === 'string') d = JSON.parse(attrs)

                            if (Array.isArray(d)) {
                                return d.map((item: any) => {
                                    if (typeof item === 'string') {
                                        const [k, v] = item.split(":").map((s: string) => s.trim())
                                        return { key: k || item, value: v || "" }
                                    }
                                    if (typeof item === 'object' && item !== null) {
                                        const key = item.key ?? item.name ?? item.label ?? Object.keys(item)[0]
                                        const value = item.value ?? item.val ?? item.v ?? item[key] ?? ""
                                        return { key: String(key), value: String(value ?? "") }
                                    }
                                    return { key: String(item), value: "" }
                                }).filter(Boolean)
                            }

                            if (typeof d === 'object' && d !== null) {
                                return Object.entries(d).map(([k, v]) => ({ key: k, value: v === null || v === undefined ? '' : String(v) }))
                            }
                        } catch (err) {
                            console.warn('Failed to parse fetched attributes for edit form', err)
                        }
                        return []
                    }

                    const attrs = normalizeAttributes(data.attributes || data.specs || data.specifications || data.custom_attributes || data.custom_attributes_json || data.meta || data.metadata || {})
                    if (attrs && attrs.length > 0) setCustomFields(attrs.map(a => ({ key: a.key, value: a.value })))

                } catch (err) {
                    console.warn('Failed to fetch full product details for edit:', err)
                }
            })()

        return () => { mounted = false }
    }, [editing, existing && (existing as any).id])

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

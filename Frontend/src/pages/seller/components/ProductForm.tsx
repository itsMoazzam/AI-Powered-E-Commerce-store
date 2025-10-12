
// FILE: src/pages/seller/components/ProductForm.tsx
import { useState } from "react"
// import api from "../../../lib/api"

type Product = {
    id: number;
    title: string;
    price: number | string;
    thumbnail?: string;
    model_3d?: string;
};

interface ProductFormProps {
    onCreated: (product: Product) => void;
}

export default function ProductForm({ onCreated }: ProductFormProps) {
    const [title, setTitle] = useState("")
    const [price, setPrice] = useState<number | string>("")
    const [image, setImage] = useState<File | null>(null)
    const [model, setModel] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    async function create() {
        if (!title || !price) return alert("Title and price required")
        setLoading(true)
        const form = new FormData()
        form.append('title', title)
        form.append('price', String(price))
        if (image) form.append('image', image)
        if (model) form.append('model_3d', model)

        try {
            // uncomment to use backend
            // const { data } = await api.post('/api/seller/products/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
            // onCreated(data)

            // Demo feedback
            const demo = { id: Date.now(), title, price, thumbnail: image ? URL.createObjectURL(image) : undefined, model_3d: model ? model.name : undefined }
            onCreated(demo)
            setTitle("")
            setPrice("")
            setImage(null)
            setModel(null)
        } catch (e) {
            console.error(e)
            alert('Failed to create product')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card p-6 bg-white dark:bg-zinc-950 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-3">Add New Product</h3>
            <div className="grid gap-3">
                <label className="text-sm">Title</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
                <label className="text-sm">Price</label>
                <input
                    type="number"
                    className="input"
                    value={typeof price === "number" ? price : ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                />
                <label className="text-sm">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                <label className="text-sm">3D Model (.glb)</label>
                <input type="file" accept=".glb,.gltf" onChange={(e) => setModel(e.target.files?.[0] || null)} />
                <div className="flex gap-2 mt-2">
                    <button className="btn-primary" onClick={create} disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
                    <button className="btn-outline" onClick={() => { setTitle(''); setPrice(''); setImage(null); setModel(null) }}>Reset</button>
                </div>
            </div>
        </div>
    )
}



import { useParams } from "react-router-dom"
import ProductGrid from "../../components/Products/ProductGrid"
import { useEffect, useState } from 'react'
import api from '../../lib/api'

function RelatedForCategory({ slug }: { slug?: string }) {
    const [items, setItems] = useState<any[]>([])
    useEffect(() => {
        if (!slug) return
        let isMounted = true
            ; (async () => {
                try {
                    const { data } = await api.get('/api/products/', { params: { category_slug: slug, page_size: 8 } })
                    const list = data?.results ?? data ?? []
                    if (isMounted && Array.isArray(list)) setItems(list.slice(0, 8))
                } catch (e) { /* ignore */ }
            })()
        return () => { isMounted = false }
    }, [slug])

    if (!items.length) return null
    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Suggested from this category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((p) => (
                    <a key={p.id} href={`/product/${p.id}`} className="block   bg-blue-50 p-2">
                        <img src={p.thumbnail || '/placeholder.png'} alt={p.title || 'Product image'} className="w-full h-32 object-content rounded bg-gray-100 " />
                        <div className="mt-2 text-sm font-medium truncate">{p.title}</div>
                        <div className="text-xs text-muted">${Number(p.price ?? 0).toFixed(2)}</div>
                    </a>
                ))}
            </div>
        </div>
    )
}

export default function CategoryPage() {
    const { categorySlug } = useParams<{ categorySlug: string }>()



    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                {categorySlug?.replace("-", " ")}
            </h1>
            <ProductGrid CategorySlug={categorySlug as any} />
            <RelatedForCategory slug={categorySlug} />
        </div>
    )
}

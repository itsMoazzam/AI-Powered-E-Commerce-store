import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
// import api from "../../lib/api"   // backend ready
import { demoProducts, DemoProduct } from "../../lib/demoProducts"
import ProductGrid from "../../components/Home/ProductGrid"

export default function CategoryPage() {
    const { categorySlug } = useParams<{ categorySlug: string }>()
    const [items, setItems] = useState<DemoProduct[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)

        // ✅ Backend call (ready for Django)
        /*
        api.get(`/api/products/?category=${categorySlug}`).then(res => {
          setItems(res.data)
          setLoading(false)
        })
        */

        // ✅ Demo data fallback
        const formatted = categorySlug?.replace("-", " ") || ""
        const filtered = demoProducts.filter(
            (p) => p.category.toLowerCase() === formatted.toLowerCase()
        )
        setItems(filtered)
        setLoading(false)
    }, [categorySlug])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                {categorySlug?.replace("-", " ")}
            </h1>
            <ProductGrid items={items} loading={loading} />
        </div>
    )
}

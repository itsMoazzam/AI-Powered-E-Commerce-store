import { useEffect, useState } from "react"
import api from "../lib/api"
import HeroBanner from "../components/Home/HeroBanner"
import CategoryGrid from "../components/Home/CategoryGrid"
import ProductGrid from "../components/Home/ProductGrid"

interface Product {
    id: number
    title: string
    price: number
    thumbnail: string
    has3d?: boolean
    rating?: number
    discount?: number
}

export default function Home() {
    const [items, setItems] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/api/products/")
                setItems(data)
            } catch (error) {
                console.error("Failed to fetch products", error)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    return (
        <div className="space-y-10">
            <HeroBanner />
            <CategoryGrid />
            <ProductGrid items={items} loading={loading} />
        </div>
    )
}

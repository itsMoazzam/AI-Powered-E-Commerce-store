import ProductCard from "./ProductCard"

interface Product {
    id: number
    title: string
    price: number
    thumbnail: string
    has3d?: boolean
    rating?: number
    discount?: number
}

export default function ProductGrid({ items, loading }: { items: Product[]; loading: boolean }) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Featured Products</h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="card overflow-hidden animate-pulse">
                            <div className="h-44 w-full bg-zinc-200 dark:bg-zinc-800" />
                            <div className="p-3 space-y-2">
                                <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded" />
                            </div>
                        </div>
                    ))
                    : items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
        </div>
    )
}

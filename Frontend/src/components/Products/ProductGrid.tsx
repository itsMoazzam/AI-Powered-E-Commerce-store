import { useEffect, useState } from "react"
import ProductCard from "./ProductCard"
import api from "../../lib/api"
import FilterSidebar from "./FilterSidebar"
import type { FilterValues } from "./FilterSidebar"
import Pagination from "./Pagination"

interface Product {
    id: number
    title: string
    price: number | string
    thumbnail: string
    has3d?: boolean
    rating?: number
    discount?: number
}

interface PaginatedResponse {
    count: number
    next: string | null
    previous: string | null
    results: any[]
}

interface Props {
    CategorySlug?: string | null;
    SearchText?: string | null;
}

export default function ProductGrid({ 
    CategorySlug = null, 
    SearchText = null 
}: Props = {}) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalProducts, setTotalProducts] = useState(0)
    const [filters, setFilters] = useState<FilterValues>({
        price__gte: 0,
        price__lte: 10000,
        discount__gte: 0,
        search_text: undefined,
    })

    const PRODUCTS_PER_PAGE = 10
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)

                // Create query params from filters
                const queryParams = new URLSearchParams({
                    page: currentPage.toString()
                })

                // Add all non-empty filters to query params
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== '' && value !== null && value !== undefined) {
                        queryParams.append(key, String(value))
                    }
                })

                // Add category_slug if provided
                if (CategorySlug) {
                    queryParams.append("category_slug", CategorySlug)
                }

                // Add search_text if provided
                if (SearchText) {
                    queryParams.append("search_text", SearchText)
                }

                // Make the API call with all filters
                const response = await api.get(`/api/products/?${queryParams}`)
                const data = response.data as PaginatedResponse
                console.log(response.data)

                setTotalProducts(data.count)
                const formattedProducts = data.results.map((p: any) => ({
                    ...p,
                    has3d: Boolean(p.model_3d)
                }))

                setProducts(formattedProducts)
            } catch (err) {
                console.error("Error fetching products:", err)
                setError("Failed to load products. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [currentPage, filters, CategorySlug, SearchText])

    if (loading)
        return (
            <section className="px-4 md:px-10 py-16 bg-gray-50 text-center">
                <div className="animate-pulse text-gray-400 text-lg">Loading products...</div>
            </section>
        )

    if (error)
        return (
            <section className="px-4 md:px-10 py-16 bg-gray-50 text-center text-red-500 font-medium">
                {error}
            </section>
        )

    if (!products.length)
        return (
            <section className="px-4 md:px-10 py-16 bg-gray-50 text-center text-gray-500">
                No products found.
            </section>
        )

    return (
        <div className="md:flex relative min-h-screen">
            <FilterSidebar onFilterChange={setFilters} />
            
            <section className="flex-1 px-4 md:px-8 py-6 md:py-10 bg-gray-50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Products</h2>
                    <div className="text-sm text-gray-600">
                        Showing {products.length} of {totalProducts} products
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product, index) => (
                        <ProductCard key={product.id || index} product={product as any} index={index} />
                    ))}
                </div>

                <div className="mt-8 pb-20 md:pb-0"> {/* Added padding bottom for mobile to account for filter button */}
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </section>
        </div>
    )
}

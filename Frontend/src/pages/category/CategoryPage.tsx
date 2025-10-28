import { useParams } from "react-router-dom"
import ProductGrid from "../../components/Products/ProductGrid"

export default function CategoryPage() {
    const { categorySlug } = useParams<{ categorySlug: string }>()



    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                {categorySlug?.replace("-", " ")}
            </h1>
            <ProductGrid  CategorySlug={categorySlug as any} />
        </div>
    )
}

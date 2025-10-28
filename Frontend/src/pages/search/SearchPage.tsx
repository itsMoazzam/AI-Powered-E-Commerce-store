import ProductGrid from "../../components/Products/ProductGrid"
import { useLocation } from "react-router-dom"

export default function SearchPage() {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('query');

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                {query?.replace("-", " ")}
            </h1>
            <ProductGrid  SearchText={query as any} />
        </div>
    )
}

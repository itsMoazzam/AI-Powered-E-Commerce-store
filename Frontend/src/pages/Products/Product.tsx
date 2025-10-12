// src/pages/products/Product.tsx
import { Link } from "react-router-dom"
// import api from "../../lib/api"  // <-- comment backend for now
import { demoProducts } from "../../lib/demoProducts"

export default function Product() {
    // Later you will fetch products like this:
    // const [products, setProducts] = useState([])
    // useEffect(() => { api.get("/api/products/").then(res => setProducts(res.data)) }, [])

    // For now just use demo products
    const products = demoProducts

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {products.map((p) => (
                <div key={p.id} className="card p-4 space-y-3">
                    <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-56 object-cover rounded-xl"
                    />
                    <h2 className="text-xl font-semibold">{p.title}</h2>
                    <p className="text-zinc-600 line-clamp-2">{p.description}</p>
                    <div className="font-bold">${p.price}</div>
                    <Link to={`/products/${p.id}`} className="btn-primary block text-center">
                        View Details
                    </Link>
                </div>
            ))}
        </div>
    )
}

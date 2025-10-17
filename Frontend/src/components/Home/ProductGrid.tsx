import ProductCard from "./ProductCard"

// Sample static data for testing (frontend only)
const sampleProducts = [
    {
        id: 1,
        title: "Wireless Headphones",
        price: 59.99,
        thumbnail: "https://images.unsplash.com/photo-1585386959984-a41552231693?auto=format&fit=crop&w=600&q=80",
        has3d: true,
        rating: 4.5,
        discount: 20,
    },
    {
        id: 2,
        title: "Men’s Casual Sneakers",
        price: 89.99,
        thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
        rating: 4.2,
    },
    {
        id: 3,
        title: "Smartwatch Pro Edition",
        price: 199.99,
        thumbnail: "https://images.unsplash.com/photo-1516893844322-4d8b114f3b4d?auto=format&fit=crop&w=600&q=80",
        has3d: true,
        rating: 4.8,
        discount: 15,
    },
    {
        id: 4,
        title: "Luxury Leather Handbag",
        price: 149.99,
        thumbnail: "https://images.unsplash.com/photo-1593032465171-8b44c4ce1c1d?auto=format&fit=crop&w=600&q=80",
        rating: 4.9,
    },
    {
        id: 5,
        title: "Gaming Laptop",
        price: 1299.99,
        thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
        has3d: true,
        rating: 4.7,
    },
]

export default function ProductGrid() {
    // 🔹 Future Backend Integration (commented for now)
    /*
    useEffect(() => {
        fetch("/api/products/")
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error("Error fetching products:", err))
    }, [])
    */

    return (
        <section className="px-4 md:px-10 py-10 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sampleProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                ))}
            </div>
        </section>
    )
}

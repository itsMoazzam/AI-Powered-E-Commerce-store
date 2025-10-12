// src/pages/products/ProductDetail.tsx
import { Suspense, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
// import api from "../../lib/api" // backend (commented)
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei"
import { demoProducts } from "../../lib/demoProducts"

// Reviews
import ReviewList from "../../components/Reviews/ReviewList"
import ReviewForm from "../../components/Reviews/ReviewForm"

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url, true)
    return <primitive object={scene} />
}

export default function ProductDetail() {
    const { id } = useParams()
    const [product, setProduct] = useState<any>(null)

    useEffect(() => {
        // Future backend call:
        // api.get(`/api/products/${id}/`).then(res => setProduct(res.data))

        // For now, load demo product
        const found = demoProducts.find((p) => p.id === Number(id))
        setProduct(found || null)
    }, [id])

    if (!product) return <div>Loading…</div>

    return (
        <div className="space-y-10 p-6">
            {/* --- Product details --- */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="card p-2 min-h-[420px]">
                    {product.model_3d ? (
                        <Canvas camera={{ position: [1.2, 1, 1.2], fov: 50 }}>
                            <ambientLight intensity={0.7} />
                            <Suspense fallback={<Html center>Loading 3D…</Html>}>
                                <Model url={product.model_3d} />
                                <Environment preset="city" />
                                <OrbitControls enablePan enableZoom enableRotate />
                            </Suspense>
                        </Canvas>
                    ) : (
                        <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-[420px] object-cover rounded-xl"
                        />
                    )}
                </div>

                <div className="space-y-4">
                    <h1 className="text-2xl font-semibold">{product.title}</h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        {product.description}
                    </p>
                    <div className="text-3xl font-bold">${Number(product.price).toFixed(2)}</div>
                    <div className="flex gap-2">
                        <button
                            className="btn-primary"
                            onClick={async () => {
                                // await api.post("/api/cart/add/", { product: product.id, qty: 1 })
                                alert("Added to cart (demo)")
                            }}
                        >
                            Add to Cart
                        </button>
                        <button
                            className="btn-outline"
                            onClick={async () => {
                                // await api.post("/api/wishlist/add/", { product: product.id })
                                alert("Added to wishlist (demo)")
                            }}
                        >
                            Wishlist
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Reviews Section --- */}
            <div className="space-y-6">
                <ReviewForm productId={product.id} />
                <ReviewList productId={product.id} />
            </div>
        </div>
    )
}

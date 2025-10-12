
// FILE: src/pages/seller/components/ProductList.tsx
import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei"

function ModelPreview({ url }: { url: string }) {
    // useGLTF must always be called unconditionally
    const { scene } = useGLTF(url, true)
    return <primitive object={scene} />
}

interface Product {
    id: string | number
    title: string
    price: number
    thumbnail?: string
    image?: string
    model_3d?: string
}

export default function ProductList({ products }: { products: Product[] }) {
    return (
        <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6 bg-white dark:bg-zinc-950 rounded-xl shadow">
                <h3 className="text-lg font-semibold mb-3">Your Products</h3>
                <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
                    {products.map((p: Product) => (
                        <div key={p.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800">
                            <div className="flex items-center gap-3">
                                <img src={p.thumbnail || p.image} className="w-16 h-16 rounded-md object-cover" />
                                <div>
                                    <div className="font-medium">{p.title}</div>
                                    <div className="text-sm text-zinc-500">${p.price}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {p.model_3d ? (
                                    <div className="w-28 h-20 border rounded overflow-hidden">
                                        <Canvas camera={{ position: [1, 1, 1.5], fov: 50 }}>
                                            <ambientLight intensity={0.8} />
                                            <Suspense fallback={<Html center>Loading 3D</Html>}>
                                                <ModelPreview url={p.model_3d} />
                                                <Environment preset="studio" />
                                                <OrbitControls enablePan enableRotate enableZoom />
                                            </Suspense>
                                        </Canvas>
                                    </div>
                                ) : (
                                    <div className="text-xs text-zinc-500">No 3D model</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card p-6 bg-white dark:bg-zinc-950 rounded-xl shadow">
                <h3 className="text-lg font-semibold mb-3">Performance & Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                        <div className="text-sm text-zinc-500">Total Views (30d)</div>
                        <div className="text-xl font-semibold mt-1">12.4k</div>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                        <div className="text-sm text-zinc-500">Orders (30d)</div>
                        <div className="text-xl font-semibold mt-1">421</div>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                        <div className="text-sm text-zinc-500">3D Products</div>
                        <div className="text-xl font-semibold mt-1">{products.filter((p: Product) => p.model_3d).length}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                        <div className="text-sm text-zinc-500">Avg Revenue</div>
                        <div className="text-xl font-semibold mt-1">$2,130</div>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button className="btn-primary">Promote Product</button>
                    <button className="btn-outline">Bulk Upload</button>
                </div>
            </div>
        </div>
    )
}

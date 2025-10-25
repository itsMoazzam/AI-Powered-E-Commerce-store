// src/components/Product3DPreview.tsx
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, useGLTF } from "@react-three/drei"
import { Suspense, useState, useEffect } from "react"

interface Product3DPreviewProps {
    url: string
}

const BASE_URL = "http://127.0.0.1:8000" // 👈 update to your backend URL

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url)
    return <primitive object={scene} scale={1.5} />
}

export default function Product3DPreview({ url }: Product3DPreviewProps) {
    const [validUrl, setValidUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!url) {
            setError("Missing 3D model URL.")
            return
        }

        // Build full backend URL if needed
        const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`
        const lower = fullUrl.toLowerCase()

        if (lower.endsWith(".glb") || lower.endsWith(".gltf")) {
            setValidUrl(fullUrl)
            setError(null)
        } else {
            setError("Invalid 3D model file type.")
        }
    }, [url])

    if (error) {
        return (
            <div className="w-full h-[500px] flex items-center justify-center bg-red-50 text-red-600 rounded-xl border border-red-200">
                {error}
            </div>
        )
    }

    return (
        <div className="w-full h-[500px] bg-zinc-100 rounded-xl relative">
            <Suspense
                fallback={
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
                        Loading 3D model...
                    </div>
                }
            >
                <Canvas camera={{ position: [2, 2, 2], fov: 45 }}>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[5, 5, 5]} intensity={1.2} />
                    <Environment preset="studio" />
                    <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1.5} />

                    {validUrl ? (
                        <ErrorBoundary onError={() => setError("Failed to load 3D model.")}>
                            <Model url={validUrl} />
                        </ErrorBoundary>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
                            Invalid 3D file path.
                        </div>
                    )}
                </Canvas>
            </Suspense>
        </div>
    )
}

// Simple React error boundary for 3D model loading failures
function ErrorBoundary({
    children,
    onError,
}: {
    children: React.ReactNode
    onError: () => void
}) {
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        if (hasError) onError()
    }, [hasError, onError])

    return hasError ? null : <>{children}</>
}

// Optional preload (safe ESLint)
try {
    useGLTF.preload("/sample-model.glb")
} catch {
    /* no-op */
}

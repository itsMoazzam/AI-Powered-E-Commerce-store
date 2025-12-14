import HeroBanner from "../components/Home/HeroBanner"
import ProductGrid from "../components/Home/ProductGrid"
import CategoriesStrip from "../components/Home/CategoriesStrip"
import { useState } from 'react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function Home() {
    const [hideNote, setHideNote] = useState(false)
    return (
        <div className="space-y-10">
            {/* {GOOGLE_CLIENT_ID && !hideNote && import.meta.env.MODE === 'development' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded max-w-4xl mx-auto mt-4 text-sm text-yellow-800">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <strong>Google OAuth notice:</strong> Client ID is configured for this app. If you see a console error like "The given origin is not allowed for the given client ID" (403), add your app origin (for example <code>http://localhost:5173</code>) to the OAuth client's <em>Authorized JavaScript origins</em> in Google Cloud Console. See project docs: <code>GOOGLE_OAUTH_FIX.md</code>
                        </div>
                        <button onClick={() => setHideNote(true)} className="text-sm text-yellow-700 underline">Dismiss</button>
                    </div>
                </div>
            )} */}
            <HeroBanner />

            {/* Categories strip under hero banner */}
            <CategoriesStrip />

            {/* Main content: product grid (full width) */}
            <div>
                <ProductGrid />
            </div>
        </div>
    )
}

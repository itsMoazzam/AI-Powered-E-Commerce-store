import HeroBanner from "../components/Home/HeroBanner"
import ProductGrid from "../components/Home/ProductGrid"
import TopSellers from "../components/TopSellers"


export default function Home() {

    return (
        <div className="space-y-10">

            <HeroBanner />
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ProductGrid />
                </div>
                <div className="space-y-6">
                    <TopSellers />
                </div>
            </div>
        </div>
    )
}

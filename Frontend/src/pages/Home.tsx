import HeroBanner from "../components/Home/HeroBanner"
import ProductGrid from "../components/Home/ProductGrid"


export default function Home() {

    return (
        <div className="space-y-10">

            <HeroBanner />
            <ProductGrid />
        </div>
    )
}

import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import api from "../../lib/api"
import { useTheme } from "../../theme/ThemeProvider"
import ThreeDot from "../threeDot"

interface Advertisement {
    id: number
    title: string
    subtitle: string
    cta_text: string
    cta_link: string
    image: string
    seller_id?: number
    type?: "new_arrivals" | "custom"
}

const defaultSlides = [
    {
        id: 1,
        title: "Discover the Latest Trends",
        subtitle: "Shop smart. Look sharp.",
        cta_text: "Shop Now",
        cta_link: "/shop",
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1600&q=80",
    },
    {
        id: 2,
        title: "New Arrivals Just In",
        subtitle: "Fresh styles for every season.",
        cta_text: "Explore",
        cta_link: "/search?sort=new",
        image: "https://koriah.com.au/cdn/shop/articles/kpop-outfits-a-visual-journey-into-the-world-of-kpop-fashion.jpg?v=1731290036",
    },
    {
        id: 3,
        title: "Exclusive Offers Await",
        subtitle: "Upgrade your look at unbeatable prices.",
        cta_text: "See Deals",
        cta_link: "/search?discount=true",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80",
    },
]

export default function HeroBanner() {
    const { primary } = useTheme()
    const [current, setCurrent] = useState(0)
    const [slides, setSlides] = useState<Advertisement[]>(defaultSlides)
    const [loading, setLoading] = useState(true)
    // one-time guard to avoid noisy proxy/network errors
    let adFetchWarningShown = false

    useEffect(() => {
        // Fetch seller advertisements publicly (no auth) so all visitors can see seller ads.
        const fetchAds = async () => {
            try {
                // Try public fetch first for guests (avoid axios auth redirects)
                try {
                    const res = await fetch('/api/advertisements/')
                    if (res.ok) {
                        const data = await res.json()
                        if (Array.isArray(data) && data.length > 0) {
                            const sellerAds = data.filter((d: any) => d && d.seller_id)
                            const otherAds = data.filter((d: any) => !d || !d.seller_id)
                            const combined = [...sellerAds, ...otherAds]
                            const toUse = combined.length < 3 ? [...combined, ...defaultSlides.slice(0, 3 - combined.length)] : combined.slice(0, 5)
                            setSlides(toUse)
                            if (import.meta.env.DEV) console.debug('HeroBanner: loaded advertisements', { total: data.length, sellerAds: sellerAds.length })
                            return
                        }
                    }
                } catch (e) { /* fallback */ }

                // fallback to legacy endpoint or default
                try {
                    const res2 = await fetch('/api/advertisements/')
                    if (res2.ok) {
                        const data2 = await res2.json()
                        if (Array.isArray(data2) && data2.length > 0) {
                            setSlides(data2.slice(0, 5))
                            return
                        }
                    }
                } catch (e) { }

                setSlides(defaultSlides)
            } catch (err) {
                const msg = String(err)
                const isNetworkErr = msg.includes('ECONNREFUSED') || msg.includes('NetworkError') || msg.includes('ERR_FAILED') || msg.includes('ERR_BLOCKED_BY_CLIENT')
                if (isNetworkErr && !adFetchWarningShown) {
                    adFetchWarningShown = true
                    console.warn('Advertisements unavailable (proxy or network). Showing default slides instead.')
                } else if (!isNetworkErr && import.meta.env.DEV) {
                    console.debug('HeroBanner: fetch error', err)
                }
                setSlides(defaultSlides)
            } finally {
                setLoading(false)
            }
        }

        fetchAds()
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [slides.length])

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length)
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

    if (loading) {
        return (
            // <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] rounded-2xl sm:rounded-3xl overflow-hidden" style={{ background: 'var(--surface)' }}>
            //     <div className="absolute inset-0 flex items-center justify-center">
            <div><ThreeDot /></div>
            //     </div>
            // </div>
        )
    }

    return (
        <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden shadow-lg">
            {slides.map((slide, index) => (
                <div
                    key={`slide-${slide.id ?? index}-${index}`}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${current === index ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="h-full w-full object-cover mx-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-20 text-white">
                        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-lg max-w-2xl">
                            {slide.title}
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg lg:text-2xl mt-2 sm:mt-3 md:mt-4 max-w-xl text-white/90 drop-shadow-md">
                            {slide.subtitle}
                        </p>
                        <Link
                            to={slide.cta_link}
                            className="w-fit mt-4 sm:mt-6 inline-block text-white font-semibold px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg md:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                            style={{ background: primary }}
                        >
                            {slide.cta_text}
                        </Link>

                        {/* Badge for seller ads (visible to all visitors); links to seller page if available */}
                        {slide.seller_id && (
                            <Link to={`/seller/${slide.seller_id}`} className="mt-3 w-fit text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 inline-flex items-center gap-2" title="View seller">
                                <span>🎯 Featured Seller</span>
                                <span className="text-[10px] opacity-80">View</span>
                            </Link>
                        )}
                    </div>
                </div>
            ))}

            {/* Navigation Buttons */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute top-1/2 left-3 sm:left-5 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 sm:p-3 transition-all hover:scale-110"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute top-1/2 right-3 sm:right-5 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 sm:p-3 transition-all hover:scale-110"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 flex-wrap justify-center px-2">
                        {slides.map((_, i) => (
                            <button
                                key={`dot-${i}`}
                                onClick={() => setCurrent(i)}
                                className={`rounded-full transition-all duration-300 ${i === current ? "scale-110" : "hover:scale-110"}`}
                                style={{
                                    width: i === current ? '32px' : '12px',
                                    height: '12px',
                                    background: i === current ? primary : 'rgba(255, 255, 255, 0.6)',
                                }}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

const slides = [
    {
        id: 1,
        title: "Discover the Latest Trends",
        subtitle: "Shop smart. Look sharp.",
        cta: "Shop Now",
        link: "/shop",
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1600&q=80",
    },
    {
        id: 2,
        title: "New Arrivals Just In",
        subtitle: "Fresh styles for every season.",
        cta: "Explore",
        link: "/new-arrivals",
        image: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd53?auto=format&fit=crop&w=1600&q=80",
    },
    {
        id: 3,
        title: "Exclusive Offers Await",
        subtitle: "Upgrade your look at unbeatable prices.",
        cta: "See Deals",
        link: "/offers",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80",
    },
]

export default function HeroBanner() {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [])

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length)
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

    return (
        <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden rounded-3xl shadow-lg bg-card">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${current === index ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-20 text-on-hero">
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg">
                            {slide.title}
                        </h1>
                        <p className="text-lg md:text-2xl mt-3 max-w-xl text-on-hero">
                            {slide.subtitle}
                        </p>
                        <Link
                            to={slide.link}
                            className="w-1/7 text-center mt-6 inline-block btn-primary text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300"
                        >
                            {slide.cta}
                        </Link>
                    </div>
                </div>
            ))}

            {/* Navigation */}
            <button
                onClick={prevSlide}
                className="absolute top-1/2 left-5 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-3"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute top-1/2 right-5 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-3"
            >
                <ChevronRight size={24} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${i === current ? "bg-indigo-500 scale-110" : "bg-white/60 hover:bg-white"
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

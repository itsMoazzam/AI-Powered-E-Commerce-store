import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

const slides = [
    {
        id: 1,
        title: "Shop the Latest Trends",
        subtitle: "Discover exclusive deals and personalized picks",
        cta: "Start Shopping",
        link: "/shop",
        image: "https://i.ibb.co/27BvNmms/cropped-circle-image.png",
    },
    {
        id: 2,
        title: "New Arrivals",
        subtitle: "Fresh styles curated just for you",
        cta: "Explore Now",
        link: "/new-arrivals",
        image: "https://i.ibb.co/27BvNmms/cropped-circle-image.png",
    },
    {
        id: 3,
        title: "Exclusive Deals",
        subtitle: "Save big with our seasonal discounts",
        cta: "View Offers",
        link: "/deals",
        image: "https://i.ibb.co/27BvNmms/cropped-circle-image.png",
    },
]

const HeroBanner = () => {
    const [current, setCurrent] = useState(0)

    // Auto-play every 5s
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length)
    const prevSlide = () =>
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

    return (
        <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden rounded-2xl">
            {slides.map((slide, index) => (
                <motion.div
                    key={slide.id}
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: current === index ? 1 : 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ pointerEvents: current === index ? "auto" : "none" }}
                >
                    {/* Background image */}
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-20 text-white space-y-4">
                        <motion.h1
                            key={slide.title}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl md:text-6xl font-bold max-w-xl"
                        >
                            {slide.title}
                        </motion.h1>
                        <motion.p
                            key={slide.subtitle}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg md:text-2xl max-w-lg"
                        >
                            {slide.subtitle}
                        </motion.p>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Link
                                to={slide.link}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg text-lg font-semibold transition"
                            >
                                {slide.cta}
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute top-1/2 left-4 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute top-1/2 right-4 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-3 h-3 rounded-full transition ${i === current ? "bg-white" : "bg-white/50"
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

export default HeroBanner
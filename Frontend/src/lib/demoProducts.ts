// src/lib/demoProducts.ts

export type ProductVideo = {
    id: number
    video: string
    preview_image?: string | null
}

export type Seller = {
    name: string
    logo: string
}

export type DemoProduct = {
    id: number
    title: string
    price: number
    thumbnail: string
    category: string
    subCategory?: string
    has3d?: boolean
    rating?: number
    ratingCount?: number
    reviewsCount?: number
    discount?: number
    description?: string
    seller?: Seller
    videos?: ProductVideo[]
}

export const demoProducts: DemoProduct[] = [
    // --- Men ---
    {
        id: 1,
        title: "Men's Casual Shirt",
        price: 29.99,
        thumbnail: "/images/men-shirt.jpg",
        category: "Men",
        subCategory: "Clothing",
        has3d: true,
        rating: 4.2,
        ratingCount: 128,
        reviewsCount: 46,
        discount: 15,
        description:
            "Crafted from soft cotton, this men's casual shirt offers a relaxed fit perfect for everyday wear. Available in multiple colors.",
        seller: { name: "Urban Threads", logo: "/images/seller-urban.png" },
        videos: [
            {
                id: 1,
                video: "/videos/shirt-demo.mp4",
                preview_image: "/images/shirt-preview.jpg",
            },
        ],
    },
    {
        id: 2,
        title: "Men's Running Shoes",
        price: 79.99,
        thumbnail: "/images/men-shoes.jpg",
        category: "Men",
        subCategory: "Shoes",
        has3d: true,
        rating: 4.5,
        ratingCount: 220,
        reviewsCount: 90,
        description:
            "Lightweight running shoes with breathable mesh and responsive cushioning for all-day comfort.",
        seller: { name: "FitStride", logo: "/images/seller-fitstride.png" },
    },
    {
        id: 3,
        title: "Luxury Watch",
        price: 199.99,
        thumbnail: "/images/men-watch.jpg",
        category: "Men",
        subCategory: "Watches",
        rating: 4.8,
        ratingCount: 340,
        reviewsCount: 112,
        description:
            "Elegant stainless-steel watch featuring quartz movement and water resistance. Designed for timeless sophistication.",
        seller: { name: "Elite Timepieces", logo: "/images/seller-elite.png" },
    },

    // --- Women ---
    {
        id: 4,
        title: "Women's Handbag",
        price: 59.99,
        thumbnail: "/images/women-handbag.jpg",
        category: "Women",
        subCategory: "Handbags",
        rating: 4.4,
        ratingCount: 180,
        reviewsCount: 77,
        description:
            "Premium faux leather handbag with spacious compartments and elegant gold accents — perfect for any occasion.",
        seller: { name: "Chic Trends", logo: "/images/seller-chic.png" },
    },
    {
        id: 5,
        title: "Women's Sneakers",
        price: 69.99,
        thumbnail: "/images/women-shoes.jpg",
        category: "Women",
        subCategory: "Shoes",
        has3d: true,
        discount: 10,
        rating: 4.6,
        ratingCount: 205,
        reviewsCount: 65,
        description:
            "Stylish sneakers with memory foam insoles and flexible sole design. Ideal for fashion and comfort.",
        seller: { name: "Viva Fashion", logo: "/images/seller-viva.png" },
    },

    // --- Kids ---
    {
        id: 6,
        title: "Kids' School Bag",
        price: 24.99,
        thumbnail: "/images/kids-bag.jpg",
        category: "Kids",
        subCategory: "School Supplies",
        rating: 4.3,
        reviewsCount: 34,
        description:
            "Durable and colorful school bag designed for kids, featuring multiple compartments and ergonomic straps.",
        seller: { name: "EduGear", logo: "/images/seller-edugear.png" },
    },
    {
        id: 7,
        title: "Kids' Toy Car",
        price: 14.99,
        thumbnail: "/images/kids-toy.jpg",
        category: "Kids",
        subCategory: "Toys & Games",
        rating: 4.7,
        reviewsCount: 52,
        description:
            "Exciting toy car with friction-powered motion and realistic detailing — fun for kids aged 3 and up.",
        seller: { name: "PlayWorld", logo: "/images/seller-playworld.png" },
    },

    // --- Electronics ---
    {
        id: 8,
        title: "Smartphone Pro",
        price: 699.99,
        thumbnail: "/images/smartphone.jpg",
        category: "Electronics",
        subCategory: "Smartphones",
        has3d: true,
        rating: 4.7,
        ratingCount: 910,
        reviewsCount: 321,
        description:
            "The next-gen Smartphone Pro delivers stunning performance, AI-powered camera, and a vibrant AMOLED display.",
        seller: { name: "TechOne", logo: "/images/seller-techone.png" },
        videos: [
            {
                id: 1,
                video: "/videos/phone-demo.mp4",
                preview_image: "/images/phone-preview.jpg",
            },
        ],
    },
    {
        id: 9,
        title: "Gaming Laptop",
        price: 1299.99,
        thumbnail: "/images/laptop.jpg",
        category: "Electronics",
        subCategory: "Laptops",
        rating: 4.9,
        ratingCount: 400,
        reviewsCount: 145,
        description:
            "Powerful gaming laptop featuring RTX graphics, 16GB RAM, and a fast-refresh display. Built for elite gamers.",
        seller: { name: "NextGen Tech", logo: "/images/seller-nextgen.png" },
    },

    // --- Home & Furniture ---
    {
        id: 10,
        title: "Modern Sofa",
        price: 499.99,
        thumbnail: "/images/sofa.jpg",
        category: "Home & Furniture",
        subCategory: "Living Room",
        has3d: true,
        rating: 4.5,
        ratingCount: 95,
        reviewsCount: 42,
        description:
            "A stylish and comfortable 3-seater sofa made with premium upholstery. Ideal for modern living spaces.",
        seller: { name: "Comfort Living", logo: "/images/seller-comfort.png" },
    },

    // --- Beauty ---
    {
        id: 11,
        title: "Makeup Kit",
        price: 39.99,
        thumbnail: "/images/makeup.jpg",
        category: "Beauty",
        subCategory: "Makeup",
        rating: 4.4,
        ratingCount: 130,
        reviewsCount: 53,
        description:
            "Complete all-in-one makeup kit with eyeshadows, lipsticks, and blush — perfect for travel or daily use.",
        seller: { name: "GlowUp", logo: "/images/seller-glowup.png" },
    },

    // --- Sports ---
    {
        id: 12,
        title: "Yoga Mat",
        price: 19.99,
        thumbnail: "/images/yoga-mat.jpg",
        category: "Sports",
        subCategory: "Fitness",
        rating: 4.6,
        ratingCount: 80,
        reviewsCount: 20,
        description:
            "Non-slip yoga mat made from eco-friendly material for comfort and stability during your workout.",
        seller: { name: "ZenSport", logo: "/images/seller-zensport.png" },
    },

    // --- Automotive ---
    {
        id: 13,
        title: "Car Seat Cover",
        price: 89.99,
        thumbnail: "/images/car-seat.jpg",
        category: "Automotive",
        subCategory: "Car Accessories",
        rating: 4.5,
        ratingCount: 120,
        reviewsCount: 45,
        description:
            "Premium leather car seat covers that protect your seats while enhancing comfort and luxury.",
        seller: { name: "AutoCraft", logo: "/images/seller-autocraft.png" },
    },

    // --- Books & Media ---
    {
        id: 14,
        title: "Bestselling Novel",
        price: 12.99,
        thumbnail: "/images/book.jpg",
        category: "Books & Media",
        subCategory: "Books",
        rating: 4.9,
        ratingCount: 250,
        reviewsCount: 95,
        description:
            "An award-winning novel with a compelling story that keeps readers hooked till the last page.",
        seller: { name: "LitPress", logo: "/images/seller-litpress.png" },
    },

    // --- Offers ---
    {
        id: 15,
        title: "Headphones (50% Off)",
        price: 49.99,
        thumbnail: "/images/headphones.jpg",
        category: "Offers",
        discount: 50,
        rating: 4.3,
        ratingCount: 310,
        reviewsCount: 132,
        description:
            "Noise-cancelling headphones with superior bass and 20 hours of playback. Limited-time 50% off!",
        seller: { name: "AudioMax", logo: "/images/seller-audiomax.png" },
    },

    // --- New Arrivals ---
    {
        id: 16,
        title: "Smart Glasses",
        price: 299.99,
        thumbnail: "/images/smart-glasses.jpg",
        category: "New Arrivals",
        has3d: true,
        rating: 4.6,
        ratingCount: 45,
        reviewsCount: 18,
        description:
            "Augmented-reality smart glasses with voice assistant, Bluetooth audio, and UV protection.",
        seller: { name: "FutureVision", logo: "/images/seller-futurevision.png" },
        videos: [
            {
                id: 1,
                video: "/videos/glasses-demo.mp4",
                preview_image: "/images/glasses-preview.jpg",
            },
        ],
    },
]

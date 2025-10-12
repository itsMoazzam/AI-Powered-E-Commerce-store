// src/lib/demoProducts.ts
export type DemoProduct = {
    id: number
    title: string
    price: number
    thumbnail: string
    category: string
    subCategory?: string
    has3d?: boolean
    rating?: number
    discount?: number
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
        discount: 15,
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
    },
    {
        id: 3,
        title: "Luxury Watch",
        price: 199.99,
        thumbnail: "/images/men-watch.jpg",
        category: "Men",
        subCategory: "Watches",
        rating: 4.8,
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
    },

    // --- Kids ---
    {
        id: 6,
        title: "Kids' School Bag",
        price: 24.99,
        thumbnail: "/images/kids-bag.jpg",
        category: "Kids",
        subCategory: "School Supplies",
    },
    {
        id: 7,
        title: "Kids' Toy Car",
        price: 14.99,
        thumbnail: "/images/kids-toy.jpg",
        category: "Kids",
        subCategory: "Toys & Games",
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
    },
    {
        id: 9,
        title: "Gaming Laptop",
        price: 1299.99,
        thumbnail: "/images/laptop.jpg",
        category: "Electronics",
        subCategory: "Laptops",
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
    },

    // --- Beauty ---
    {
        id: 11,
        title: "Makeup Kit",
        price: 39.99,
        thumbnail: "/images/makeup.jpg",
        category: "Beauty",
        subCategory: "Makeup",
    },

    // --- Sports ---
    {
        id: 12,
        title: "Yoga Mat",
        price: 19.99,
        thumbnail: "/images/yoga-mat.jpg",
        category: "Sports",
        subCategory: "Fitness",
    },

    // --- Automotive ---
    {
        id: 13,
        title: "Car Seat Cover",
        price: 89.99,
        thumbnail: "/images/car-seat.jpg",
        category: "Automotive",
        subCategory: "Car Accessories",
    },

    // --- Books & Media ---
    {
        id: 14,
        title: "Bestselling Novel",
        price: 12.99,
        thumbnail: "/images/book.jpg",
        category: "Books & Media",
        subCategory: "Books",
    },

    // --- Offers ---
    {
        id: 15,
        title: "Headphones (50% Off)",
        price: 49.99,
        thumbnail: "/images/headphones.jpg",
        category: "Offers",
        discount: 50,
    },

    // --- New Arrivals ---
    {
        id: 16,
        title: "Smart Glasses",
        price: 299.99,
        thumbnail: "/images/smart-glasses.jpg",
        category: "New Arrivals",
        has3d: true,
    },
]

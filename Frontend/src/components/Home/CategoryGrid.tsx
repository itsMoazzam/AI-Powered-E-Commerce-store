import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"

const categories = [
    { name: "Men", sub: ["Clothing", "Shoes", "Accessories", "Watches", "Grooming"] },
    { name: "Women", sub: ["Clothing", "Shoes", "Handbags", "Jewelry", "Beauty"] },
    { name: "Kids", sub: ["Clothing", "Shoes", "Baby Essentials", "Toys & Games", "School Supplies"] },
    { name: "Electronics", sub: ["Smartphones", "Laptops", "Headphones", "Cameras", "Gaming Consoles", "TV & Home Theater"] },
    { name: "Home & Furniture", sub: ["Living Room", "Bedroom", "Kitchen & Dining", "Decor", "Lighting", "Bedding"] },
    { name: "Beauty", sub: ["Makeup", "Skincare", "Haircare", "Fragrances"] },
    { name: "Sports", sub: ["Fitness", "Camping & Hiking", "Cycling", "Team Sports"] },
    { name: "Automotive", sub: ["Car Accessories", "Car Electronics", "Motorcycle Gear"] },
    { name: "Books & Media", sub: ["Books", "Stationery", "Music & Movies"] },
    { name: "Offers" },
    { name: "New Arrivals" },
]

export default function CategoryNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [openMenu, setOpenMenu] = useState<string | null>(null)

    const toggleMobile = () => setMobileOpen(!mobileOpen)
    const toggleDropdown = (menu: string) =>
        setOpenMenu(openMenu === menu ? null : menu)

    return (
        <nav className="bg-white shadow">
            <div className="px-4 md:px-8 flex items-center justify-between h-14">
                {/* Logo / Branding */}
                <Link to="/" className="text-lg font-bold text-indigo-600">
                    MyShop
                </Link>

                {/* Desktop Menu */}
                <ul className="hidden md:flex space-x-6 font-medium">
                    {categories.map((cat) => (
                        <li key={cat.name} className="relative group">
                            {cat.sub ? (
                                <>
                                    <button className="flex items-center gap-1 text-gray-900 hover:text-indigo-600">
                                        {cat.name}
                                    </button>
                                    {/* Dropdown on hover */}
                                    <ul className="absolute top-full left-0 w-48 bg-white shadow-md rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                                        {cat.sub.map((sub) => (
                                            <li key={sub}>
                                                <Link
                                                    to={`/category/${sub.toLowerCase().replace(/\s+/g, "-")}`}
                                                    className="block px-7 py-2 text-gray-900 hover:bg-indigo-50"
                                                >
                                                    {sub}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                // ✅ No subcategories → direct link
                                <Link
                                    to={`/category/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                                    className="text-gray-900  hover:text-indigo-600"
                                >
                                    {cat.name}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden text-gray-900" onClick={toggleMobile}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <div className="md:hidden bg-white shadow-lg p-4 space-y-4">
                    {categories.map((cat) => (
                        <div key={cat.name}>
                            {cat.sub ? (
                                <>
                                    <button
                                        onClick={() => toggleDropdown(cat.name)}
                                        className="w-full flex justify-between items-center font-medium py-2 text-gray-900 hover:text-indigo-600"
                                    >
                                        {cat.name}
                                    </button>
                                    {openMenu === cat.name && (
                                        <ul className="pl-4 space-y-2">
                                            {cat.sub.map((sub) => (
                                                <li key={sub}>
                                                    <Link
                                                        to={`/category/${sub.toLowerCase().replace(/\s+/g, "-")}`}
                                                        className="block hover:text-indigo-600 text-gray-900"
                                                    >
                                                        {sub}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to={`/category/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                                    className="block font-medium py-2 text-gray-900 hover:text-indigo-600"
                                >
                                    {cat.name}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </nav>
    )
}

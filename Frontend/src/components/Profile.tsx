import { useEffect, useState } from "react"
import api from "../lib/api"

type UserProfile = {
    username: string
    email: string
    first_name: string
    last_name: string
    role: string
    profile_photo?: string
    age?: number
    height?: number
    mobile?: string
    store_name?: string
    business_address?: string
    business_license?: string
    website?: string
    address?: string
}

export default function Profile() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadProfile() {
            try {
                const { data } = await api.get("/api/auth/profile/")
                setProfile(data)
            } catch (err) {
                console.error("Failed to fetch profile", err)
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [])

    if (loading) return <div className="p-10 text-center">Loading...</div>
    if (!profile) return <div className="p-10 text-center text-red-500">Profile not found.</div>

    const isSeller = profile.role === "seller"
    const isCustomer = profile.role === "customer"
    const isAdmin = profile.role === "admin"

    return (
        <div className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">
                {isAdmin ? "Admin Dashboard" : "My Profile"}
            </h2>

            <div className="flex flex-col sm:flex-row gap-6">
                {/* Profile Photo */}
                <div className="flex-shrink-0">
                    {profile.profile_photo ? (
                        <img
                            src={profile.profile_photo}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border border-zinc-300 shadow-sm"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-zinc-100 flex items-center justify-center text-gray-500 shadow-inner">
                            No Photo
                        </div>
                    )}
                </div>

                {/* Role Based Information */}
                <div className="flex-1 space-y-2">
                    <p><strong>Username:</strong> {profile.username}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Full Name:</strong> {profile.first_name} {profile.last_name}</p>
                    <p><strong>Role:</strong> {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</p>

                    {/* 🛍️ Seller Profile Fields */}
                    {isSeller && (
                        <>
                            {profile.store_name && <p><strong>Store Name:</strong> {profile.store_name}</p>}
                            {profile.business_address && <p><strong>Business Address:</strong> {profile.business_address}</p>}
                            {profile.address && <p><strong>Address:</strong> {profile.address}</p>}
                            {profile.mobile && <p><strong>Mobile:</strong> {profile.mobile}</p>}
                            {profile.website && (
                                <p>
                                    <strong>Website:</strong>{" "}
                                    <a href={profile.website} className="text-indigo-600 hover:underline">
                                        {profile.website}
                                    </a>
                                </p>
                            )}
                            {profile.business_license && (
                                <p>
                                    <strong>License:</strong>{" "}
                                    <a
                                        href={profile.business_license}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:underline"
                                    >
                                        View License
                                    </a>
                                </p>
                            )}
                        </>
                    )}

                    {/* 👤 Customer Profile Fields */}
                    {isCustomer && (
                        <>
                            {profile.age && <p><strong>Age:</strong> {profile.age}</p>}
                            {profile.height && <p><strong>Height:</strong> {profile.height} cm</p>}
                            {profile.address && <p><strong>Address:</strong> {profile.address}</p>}
                            {profile.mobile && <p><strong>Mobile:</strong> {profile.mobile}</p>}
                        </>
                    )}

                    {/* 🧑‍💼 Admin Info */}
                    {isAdmin && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="font-semibold text-gray-800">Superuser Access</p>
                            <p className="text-gray-600 text-sm">
                                You have full administrative privileges to manage all system data, users, and products.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

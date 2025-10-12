import React, { useState } from "react"
import api from "../../lib/api"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../store"
import { setAuth } from "../../store/auth"
import {
    UserPlus,
    Store,
    Loader2,
    Camera,
    FileText,
    ShieldCheck,
} from "lucide-react"

export default function Register() {
    const dispatch = useDispatch<AppDispatch>()
    const [form, setForm] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "customer",
        // customer fields
        age: "",
        height: "",
        address: "",
        mobile: "",
        profile_photo: null as File | null,
        // seller fields
        store_name: "",
        business_address: "",
        business_license: null as File | null,
        website: "",
    })
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        for (const key in form) {
            const value = form[key as keyof typeof form]
            if (value !== null && value !== "") {
                formData.append(key, value as string | Blob)
            }
        }

        try {
            const { data } = await api.post("/api/auth/register/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            dispatch(
                setAuth({
                    token: data.token,
                    role: data.role,
                    user: data.user,
                })
            )

            location.href = "/"
        } catch (err) {
            alert("❌ Registration failed. Please check your input and try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-950 p-4">
            <div className="w-full max-w-3xl backdrop-blur-xl shadow-2xl rounded-3xl p-8 border transition-all">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-indigo-600 text-white rounded-full p-3 mb-2">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold text-zinc-800 dark:text-white tracking-tight">
                        Create an Account
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                        Join as a Customer or Seller — start your journey today!
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Basic Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            name="username"
                            placeholder="Username"
                            className="input-field"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            className="input-field"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="first_name"
                            placeholder="First Name"
                            className="input-field"
                            value={form.first_name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="last_name"
                            placeholder="Last Name"
                            className="input-field"
                            value={form.last_name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="input-field"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="customer">Customer</option>
                            <option value="seller">Seller</option>
                        </select>
                    </div>

                    {/* Customer-specific fields */}
                    {form.role === "customer" && (
                        <div className="mt-6 space-y-4 animate-fadeIn">
                            <h3 className="flex items-center gap-2 font-semibold text-zinc-700 dark:text-zinc-300 text-lg">
                                <ShieldCheck className="w-5 h-5 text-indigo-500" /> Customer Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    name="age"
                                    type="number"
                                    placeholder="Age"
                                    className="input-field"
                                    value={form.age}
                                    onChange={handleChange}
                                />
                                <input
                                    name="height"
                                    type="number"
                                    placeholder="Height (cm)"
                                    className="input-field"
                                    value={form.height}
                                    onChange={handleChange}
                                />
                            </div>
                            <textarea
                                name="address"
                                placeholder="Address"
                                className="input-field"
                                value={form.address}
                                onChange={handleChange}
                            />
                            <input
                                name="mobile"
                                placeholder="Mobile Number"
                                className="input-field"
                                value={form.mobile}
                                onChange={handleChange}
                            />
                            <div className="flex items-center gap-3">
                                <label className="cursor-pointer text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                    <Camera className="w-4 h-4" /> Upload Profile Photo
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null
                                        setForm({ ...form, profile_photo: file })
                                        if (file) setPreview(URL.createObjectURL(file))
                                    }}
                                    className="hidden"
                                />
                            </div>
                            {preview && (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-24 h-24 rounded-full object-cover border mt-2 shadow-sm"
                                />
                            )}
                        </div>
                    )}

                    {/* Seller-specific fields */}
                    {form.role === "seller" && (
                        <div className="mt-6 space-y-4 animate-fadeIn">
                            <h3 className="flex items-center gap-2 font-semibold text-zinc-700 dark:text-zinc-300 text-lg">
                                <Store className="w-5 h-5 text-indigo-500" /> Business Details
                            </h3>
                            <input
                                name="store_name"
                                placeholder="Store Name"
                                className="input-field"
                                value={form.store_name}
                                onChange={handleChange}
                                required
                            />
                            <textarea
                                name="business_address"
                                placeholder="Business Address"
                                className="input-field"
                                value={form.business_address}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="url"
                                name="website"
                                placeholder="Website (optional)"
                                className="input-field"
                                value={form.website}
                                onChange={handleChange}
                            />
                            <div className="flex items-center gap-3">
                                <label className="cursor-pointer text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Upload Business License
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.png"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            business_license: e.target.files?.[0] || null,
                                        })
                                    }
                                    className="hidden"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        className={`w-full flex justify-center items-center gap-2 py-3 rounded-xl font-semibold text-white transition ${loading
                            ? "bg-indigo-400"
                            : "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                            }`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Registering…
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-6">
                    Already have an account?{" "}
                    <a
                        href="/login"
                        className="text-indigo-600 hover:underline font-medium"
                    >
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    )
}

import React, { useEffect, useState } from "react";
import type { Role, CustomerForm, SellerForm } from "./Register";
import { GoogleLogin } from "@react-oauth/google";

type GenericForm = CustomerForm | SellerForm;

type StepPersonalProps<T extends GenericForm> = {
    form: T;
    onChange: <K extends keyof T>(key: K, value: T[K]) => void;
    next?: () => void;
    role: Role;
    setRole: (r: Role) => void;
};

export default function StepPersonal<T extends GenericForm>({
    form,
    onChange,
    role,
    setRole,
}: StepPersonalProps<T>) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        // safe File check: ensure File exists in runtime environment
        const val = (form as any).profile_photo;
        if (val && typeof File !== "undefined" && typeof (val as File).name === "string" && typeof (val as File).size === "number") {
            const url = URL.createObjectURL(val as File);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        } else if (typeof val === "string") {
            setPreview(val);
        } else {
            setPreview(null);
        }
    }, [form]);

    const initials =
        (form.first_name && form.first_name[0]?.toUpperCase()) ||
        (form.username && form.username[0]?.toUpperCase()) ||
        "U";

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Personal Details</h2>

            <div className="flex flex-col items-center gap-3">
                <div className="relative">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Profile preview"
                            className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-sm">
                            {initials}
                        </div>
                    )}

                    <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 cursor-pointer hover:bg-indigo-700 transition">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                // cast to T[K] safely for onChange
                                onChange("profile_photo" as any, file as any);
                            }}
                        />
                        📷
                    </label>
                </div>

                <p className="text-sm text-gray-500">Upload profile photo (optional)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                    className="border border-gray-300 rounded-xl px-4 py-2 w-full text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Username"
                    value={(form.username ?? "") as string}
                    onChange={(e) => onChange("username" as any, e.target.value as any)}
                    required
                />
                <input
                    className="border border-gray-300 rounded-xl px-4 py-2 w-full text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Email"
                    type="email"
                    value={(form.email ?? "") as string}
                    onChange={(e) => onChange("email" as any, e.target.value as any)}
                    required
                />

                <input
                    className="border border-gray-300 rounded-xl px-4 py-2 w-full text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="First Name"
                    value={(form.first_name ?? "") as string}
                    onChange={(e) => onChange("first_name" as any, e.target.value as any)}
                    required
                />
                <input
                    className="border border-gray-300 rounded-xl px-4 py-2 w-full text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Last Name"
                    value={(form.last_name ?? "") as string}
                    onChange={(e) => onChange("last_name" as any, e.target.value as any)}
                    required
                />

                <input
                    className="border border-gray-300 rounded-xl px-4 py-2 w-full text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Password"
                    type="password"
                    value={(form.password ?? "") as string}
                    onChange={(e) => onChange("password" as any, e.target.value as any)}
                    required
                />

                <select
                    className="border border-gray-300 rounded-xl px-4 py-2 w-full text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                >
                    <option value="customer">Customer</option>
                    <option value="seller">Seller</option>
                </select>
            </div>

            <div className="flex items-center justify-center gap-4">
                <div className="text-sm text-gray-500">Or sign up with</div>
                <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        console.log("Google login success:", credentialResponse);
                        // send credentialResponse.credential to backend to verify + create account
                    }}
                    onError={() => {
                        console.log("Google login failed");
                    }}
                />
            </div>
        </div>
    );
}

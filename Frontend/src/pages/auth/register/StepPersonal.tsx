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
    next,
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
                <select
                    className="border border-gray-300 rounded-xl px-4 py-2 w-full text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                >
                    <option value="customer">Customer</option>
                    <option value="seller">Seller</option>
                </select>
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


            </div>

            <div className="flex items-center justify-center gap-4">
                <div className="text-sm text-gray-500">Or sign up with</div>
                <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        try {
                            const credential = (credentialResponse as any)?.credential;
                            if (!credential) return;

                            // decode the JWT payload without any external library
                            const decodeJwt = (token: string) => {
                                const parts = token.split('.');
                                if (parts.length < 2) return null;
                                const base64Url = parts[1];
                                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                                try {
                                    const jsonPayload = decodeURIComponent(
                                        atob(base64)
                                            .split('')
                                            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                                            .join('')
                                    );
                                    return JSON.parse(jsonPayload);
                                } catch (e) {
                                    return null;
                                }
                            };

                            const payload = decodeJwt(credential) || ({} as any);
                            const email = payload.email as string | undefined;
                            const given_name = payload.given_name as string | undefined;
                            const family_name = payload.family_name as string | undefined;
                            const picture = payload.picture as string | undefined;
                            const name = payload.name as string | undefined;

                            // derive a username (safe fallback)
                            const usernameFromEmail = email ? email.split('@')[0] : undefined;
                            const username = (usernameFromEmail || name || given_name || 'user').replace(/\s+/g, '').toLowerCase();

                            // generate a client-side random password (we cannot access the Google account password)
                            let generatedPassword = 'pw_';
                            try {
                                if (typeof crypto !== 'undefined' && (crypto as any).getRandomValues) {
                                    const arr = new Uint8Array(16);
                                    (crypto as any).getRandomValues(arr);
                                    generatedPassword = Array.from(arr)
                                        .map((b) => b.toString(16).padStart(2, '0'))
                                        .join('');
                                } else {
                                    generatedPassword = Math.random().toString(36).slice(2) + Date.now().toString(36);
                                }
                            } catch (e) {
                                generatedPassword = Math.random().toString(36).slice(2) + Date.now().toString(36);
                            }

                            // populate the form via supplied onChange handler
                            // cast to any because T is generic
                            onChange('username' as any, username as any);
                            if (email) onChange('email' as any, email as any);
                            if (given_name) onChange('first_name' as any, given_name as any);
                            if (family_name) onChange('last_name' as any, family_name as any);
                            if (picture) onChange('profile_photo' as any, picture as any);
                            onChange('password' as any, generatedPassword as any);

                            // advance to next step in the flow (StepSeller/StepCustomer or review)
                            if (typeof next === 'function') {
                                // small timeout so parent state updates propagate before navigating
                                setTimeout(() => next?.(), 150);
                            }
                        } catch (err) {
                            // best-effort; don't block the user flow
                            console.error('Google sign-in handling failed', err);
                        }
                    }}
                    onError={() => {
                        console.log('Google login failed');
                    }}
                />
            </div>
        </div>
    );
}

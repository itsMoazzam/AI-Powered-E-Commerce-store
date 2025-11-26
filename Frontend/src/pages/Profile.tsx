import React, { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import ThreeDot from "../components/threeDot";

type UserProfile = {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    profile_photo?: string;
    age?: number | null;
    height?: number | null;
    mobile?: string | null;
    store_name?: string | null;
    business_address?: string | null;
    business_license?: string | null;
    website?: string | null;
    address?: string | null;
};

export default function Profile(): React.ReactElement {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // local edit state
    const [draft, setDraft] = useState<Partial<UserProfile>>({});
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const photoRef = useRef<HTMLInputElement | null>(null);
    const licenseRef = useRef<HTMLInputElement | null>(null);
    const [licenseName, setLicenseName] = useState<string | null>(null);

    useEffect(() => {
        async function loadProfile() {
            try {
                const { data } = await api.get("/api/auth/profile/");
                setProfile(data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    useEffect(() => {
        if (profile) {
            setDraft(profile);
            setPhotoPreview(profile.profile_photo ?? null);
            setLicenseName(profile.business_license ?? null);
        }
    }, [profile]);

    function handleChange<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
        setDraft((d) => ({ ...d, [key]: value }));
    }

    function handleStartEdit() {
        setIsEditing(true);
    }

    function handleCancel() {
        setIsEditing(false);
        setDraft(profile ?? {});
        setPhotoPreview(profile?.profile_photo ?? null);
        setLicenseName(profile?.business_license ?? null);
        if (photoRef.current) photoRef.current.value = "";
        if (licenseRef.current) licenseRef.current.value = "";
    }

    async function handleSave() {
        if (!profile) return;
        setSaving(true);
        try {
            const form = new FormData();
            // Append primitive fields
            const fields: (keyof UserProfile)[] = [
                "first_name",
                "last_name",
                "mobile",
                "website",
                "address",
                "store_name",
                "business_address",
            ];
            fields.forEach((f) => {
                const val = (draft as any)[f];
                if (val !== undefined && val !== null) form.append(f, String(val));
            });

            if (draft.age !== undefined && draft.age !== null) form.append("age", String(draft.age));
            if (draft.height !== undefined && draft.height !== null) form.append("height", String(draft.height));

            // File fields
            const photoFile = photoRef.current?.files?.[0];
            if (photoFile) form.append("profile_photo", photoFile);

            const licenseFile = licenseRef.current?.files?.[0];
            if (licenseFile) form.append("business_license", licenseFile);

            // Patch the profile
            const res = await api.patch("/api/auth/profile/", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setProfile(res.data);
            setIsEditing(false);
            window.alert("Profile updated successfully.");
        } catch (err) {
            console.error("Failed to update profile", err);
            window.alert("Failed to save profile. See console for details.");
        } finally {
            setSaving(false);
        }
    }

    function handlePhotoPicked(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoPreview(URL.createObjectURL(file));
    }

    function handleLicensePicked(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setLicenseName(file.name);
    }

    if (loading) return <div className="p-10 text-center"><ThreeDot /></div>;
    if (!profile) return <div className="p-10 text-center text-red-500">Profile not found.</div>;

    const isSeller = profile.role === "seller";
    const isCustomer = profile.role === "customer";
    const isAdmin = profile.role === "admin";

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white text-gray-700 rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-start justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{isAdmin ? "Admin Dashboard" : "My Profile"}</h2>
                {!isEditing ? (
                    <button
                        onClick={handleStartEdit}
                        className="btn-primary bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div className="space-x-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                        <button onClick={handleCancel} className="btn-outline px-4 py-2 rounded-lg cursor-pointer">
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col items-center">
                    <div className="w-36 h-36 mb-4">
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Profile"
                                className="w-36 h-36 rounded-full object-cover border border-zinc-300 shadow-sm"
                            />
                        ) : (
                            <div className="w-36 h-36 rounded-full bg-zinc-100 flex items-center justify-center text-gray-500 shadow-inner">
                                No Photo
                            </div>
                        )}
                    </div>

                    {isEditing && (
                        <div className="w-full text-center">
                            <input
                                ref={photoRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    handlePhotoPicked(e);
                                }}
                                className="text-sm mb-2"
                            />
                        </div>
                    )}

                    {isSeller && (
                        <div className="w-full text-sm text-gray-600 mt-4">
                            <p className="font-semibold">Seller Info</p>
                            <p className="text-xs">Store: {profile.store_name ?? "-"}</p>
                            <p className="text-xs">Business Address: {profile.business_address ?? "-"}</p>
                            <p className="text-xs">License: {licenseName ?? (profile.business_license ? "Uploaded" : "-")}</p>
                            {isEditing && (
                                <div className="mt-2">
                                    <input ref={licenseRef} type="file" onChange={handleLicensePicked} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="md:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600">Username</label>
                            <div className="mt-1 text-gray-800 font-medium">{profile.username}</div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600">Email</label>
                            <div className="mt-1 text-gray-800 font-medium">{profile.email}</div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600">First name</label>
                            {isEditing ? (
                                <input
                                    value={String(draft.first_name ?? "")}
                                    onChange={(e) => handleChange("first_name", e.target.value)}
                                    className="mt-1 input w-full"
                                />
                            ) : (
                                <div className="mt-1">{profile.first_name}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600">Last name</label>
                            {isEditing ? (
                                <input
                                    value={String(draft.last_name ?? "")}
                                    onChange={(e) => handleChange("last_name", e.target.value)}
                                    className="mt-1 input w-full"
                                />
                            ) : (
                                <div className="mt-1">{profile.last_name}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600">Mobile</label>
                            {isEditing ? (
                                <input
                                    value={String(draft.mobile ?? "")}
                                    onChange={(e) => handleChange("mobile", e.target.value ?? null)}
                                    className="mt-1 input w-full"
                                />
                            ) : (
                                <div className="mt-1">{profile.mobile ?? "-"}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600">Website</label>
                            {isEditing ? (
                                <input
                                    value={String(draft.website ?? "")}
                                    onChange={(e) => handleChange("website", e.target.value ?? null)}
                                    className="mt-1 input w-full"
                                />
                            ) : (
                                <div className="mt-1">{profile.website ?? "-"}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600">Address</label>
                            {isEditing ? (
                                <input
                                    value={String(draft.address ?? "")}
                                    onChange={(e) => handleChange("address", e.target.value ?? null)}
                                    className="mt-1 input w-full"
                                />
                            ) : (
                                <div className="mt-1">{profile.address ?? "-"}</div>
                            )}
                        </div>

                        {isCustomer && (
                            <>
                                <div>
                                    <label className="block text-sm text-gray-600">Age</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={draft.age ?? ""}
                                            onChange={(e) => handleChange("age", e.target.value ? Number(e.target.value) : null)}
                                            className="mt-1 input w-full"
                                        />
                                    ) : (
                                        <div className="mt-1">{profile.age ?? "-"}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600">Height (cm)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={draft.height ?? ""}
                                            onChange={(e) => handleChange("height", e.target.value ? Number(e.target.value) : null)}
                                            className="mt-1 input w-full"
                                        />
                                    ) : (
                                        <div className="mt-1">{profile.height ?? "-"}</div>
                                    )}
                                </div>
                            </>
                        )}

                        {isSeller && (
                            <>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm text-gray-600">Store name</label>
                                    {isEditing ? (
                                        <input
                                            value={String(draft.store_name ?? "")}
                                            onChange={(e) => handleChange("store_name", e.target.value ?? null)}
                                            className="mt-1 input w-full"
                                        />
                                    ) : (
                                        <div className="mt-1">{profile.store_name ?? "-"}</div>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm text-gray-600">Business address</label>
                                    {isEditing ? (
                                        <textarea
                                            value={String(draft.business_address ?? "")}
                                            onChange={(e) => handleChange("business_address", e.target.value ?? null)}
                                            className="mt-1 input w-full h-24"
                                        />
                                    ) : (
                                        <div className="mt-1">{profile.business_address ?? "-"}</div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

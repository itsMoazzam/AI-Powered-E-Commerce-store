import React, { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import ThreeDot from "../components/threeDot";
import { useTheme } from "../theme/ThemeProvider";
import { Edit2, Check, X } from "lucide-react";

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
    const { primary } = useTheme();
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
        <div className="max-w-5xl mx-auto mt-4 sm:mt-8 lg:mt-12 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-card" style={{ background: 'var(--surface)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-default">{isAdmin ? "👤 Admin Dashboard" : "👤 My Profile"}</h2>
                {!isEditing ? (
                    <button
                        onClick={handleStartEdit}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium transition hover:opacity-90 w-full sm:w-auto"
                        style={{ background: primary }}
                    >
                        <Edit2 size={18} /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium transition hover:opacity-90 disabled:opacity-60 bg-green-600"
                        >
                            <Check size={18} /> {saving ? "Saving..." : "Save"}
                        </button>
                        <button onClick={handleCancel} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition border" style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}>
                            <X size={18} /> Cancel
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Photo & Seller Info */}
                <div className="md:col-span-1 flex flex-col items-center">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 mb-4">
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover border-2 shadow-md"
                                style={{ borderColor: primary }}
                            />
                        ) : (
                            <div className="w-full h-full rounded-full flex items-center justify-center text-sm text-muted font-medium" style={{ background: 'var(--bg)', borderColor: 'var(--card-border)', borderWidth: '2px' }}>
                                No Photo
                            </div>
                        )}
                    </div>

                    {isEditing && (
                        <div className="w-full text-center">
                            <label className="block text-xs sm:text-sm text-muted mb-2">Upload Photo</label>
                            <input
                                ref={photoRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoPicked}
                                className="text-xs block w-full"
                            />
                        </div>
                    )}

                    {isSeller && (
                        <div className="w-full text-sm text-default mt-6 pt-6 border-t border-card">
                            <p className="font-semibold mb-3">🏪 Seller Information</p>
                            <div className="space-y-2 text-xs text-muted">
                                <div>
                                    <span className="font-medium">Store:</span> {profile.store_name ?? "-"}
                                </div>
                                <div>
                                    <span className="font-medium">Business Address:</span> {profile.business_address ? profile.business_address.substring(0, 50) + "..." : "-"}
                                </div>
                                <div>
                                    <span className="font-medium">License:</span> {licenseName ?? (profile.business_license ? "✅ Uploaded" : "-")}
                                </div>
                            </div>
                            {isEditing && (
                                <div className="mt-3 pt-3 border-t border-card">
                                    <label className="block text-xs text-muted mb-2">Update License</label>
                                    <input ref={licenseRef} type="file" onChange={handleLicensePicked} className="text-xs" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Form Fields */}
                <div className="md:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Username */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted mb-2">Username</label>
                            <div className="text-default font-medium text-sm sm:text-base">{profile.username}</div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted mb-2">Email</label>
                            <div className="text-default font-medium text-sm sm:text-base">{profile.email}</div>
                        </div>

                        {/* First Name */}
                        {(isEditing || (profile.first_name && profile.first_name.length > 0)) && (
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-muted mb-2">First Name</label>
                                {isEditing ? (
                                    <input
                                        value={String(draft.first_name ?? "")}
                                        onChange={(e) => handleChange("first_name", e.target.value)}
                                        className="input-responsive w-full text-sm"
                                        style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                                    />
                                ) : (
                                    <div className="text-default text-sm sm:text-base">{profile.first_name}</div>
                                )}
                            </div>
                        )}

                        {/* Last Name */}
                        {(isEditing || (profile.last_name && profile.last_name.length > 0)) && (
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-muted mb-2">Last Name</label>
                                {isEditing ? (
                                    <input
                                        value={String(draft.last_name ?? "")}
                                        onChange={(e) => handleChange("last_name", e.target.value)}
                                        className="input-responsive w-full text-sm"
                                        style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                                    />
                                ) : (
                                    <div className="text-default text-sm sm:text-base">{profile.last_name}</div>
                                )}
                            </div>
                        )}

                        {/* Mobile */}
                        {(isEditing || (profile.mobile && profile.mobile.length > 0)) && (
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-muted mb-2">Mobile</label>
                                {isEditing ? (
                                    <input
                                        value={String(draft.mobile ?? "")}
                                        onChange={(e) => handleChange("mobile", e.target.value ?? null)}
                                        className="input-responsive w-full text-sm"
                                        style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                                    />
                                ) : (
                                    <div className="text-default text-sm sm:text-base">{profile.mobile}</div>
                                )}
                            </div>
                        )}

                        {/* Website */}
                        {(isEditing || (profile.website && profile.website.length > 0)) && (
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-muted mb-2">Website</label>
                                {isEditing ? (
                                    <input
                                        value={String(draft.website ?? "")}
                                        onChange={(e) => handleChange("website", e.target.value ?? null)}
                                        className="input-responsive w-full text-sm"
                                        style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                                    />
                                ) : (
                                    <div className="text-default text-sm sm:text-base">{profile.website}</div>
                                )}
                            </div>
                        )}

                        {/* Address */}
                        {(isEditing || (profile.address && profile.address.length > 0)) && (
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-muted mb-2">Address</label>
                                {isEditing ? (
                                    <input
                                        value={String(draft.address ?? "")}
                                        onChange={(e) => handleChange("address", e.target.value ?? null)}
                                        className="input-responsive w-full text-sm"
                                        style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                                    />
                                ) : (
                                    <div className="text-default text-sm sm:text-base">{profile.address}</div>
                                )}
                            </div>
                        )}

                        {/* Customer-only fields */}
                        {isCustomer && (
                            <>
                                {(isEditing || (profile.age !== undefined && profile.age !== null)) && (
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-muted mb-2">Age</label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={draft.age ?? ""}
                                                onChange={(e) => handleChange("age", e.target.value ? Number(e.target.value) : null)}
                                                className="input-responsive w-full text-sm"
                                                style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                                            />
                                        ) : (
                                            <div className="text-default text-sm sm:text-base">{profile.age}</div>
                                        )}
                                    </div>
                                )}

                                {(isEditing || (profile.height !== undefined && profile.height !== null)) && (
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-muted mb-2">Height (cm)</label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={draft.height ?? ""}
                                                onChange={(e) => handleChange("height", e.target.value ? Number(e.target.value) : null)}
                                                className="input-responsive w-full text-sm"
                                                style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                                            />
                                        ) : (
                                            <div className="text-default text-sm sm:text-base">{profile.height}</div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Seller-only fields */}
                        {isSeller && (
                            <>
                                {(isEditing || (profile.store_name && profile.store_name.length > 0)) && (
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs sm:text-sm font-medium text-muted mb-2">Store Name</label>
                                        {isEditing ? (
                                            <input
                                                value={String(draft.store_name ?? "")}
                                                onChange={(e) => handleChange("store_name", e.target.value ?? null)}
                                                className="input-responsive w-full text-sm"
                                                style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                                            />
                                        ) : (
                                            <div className="text-default text-sm sm:text-base">{profile.store_name}</div>
                                        )}
                                    </div>
                                )}

                                {(isEditing || (profile.business_address && profile.business_address.length > 0)) && (
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs sm:text-sm font-medium text-muted mb-2">Business Address</label>
                                        {isEditing ? (
                                            <textarea
                                                value={String(draft.business_address ?? "")}
                                                onChange={(e) => handleChange("business_address", e.target.value ?? null)}
                                                className="input-responsive w-full h-20 text-sm resize-none"
                                                style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                                            />
                                        ) : (
                                            <div className="text-default text-sm sm:text-base">{profile.business_address}</div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

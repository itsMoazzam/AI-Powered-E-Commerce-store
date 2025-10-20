import React, { useRef } from "react";
import type { ChangeEvent } from "react";
import type { CustomerForm } from "./Register";

type Props = {
    form: CustomerForm;
    onChange: <K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) => void;
    next: () => void;
    prev: () => void;
};

const StepCustomer: React.FC<Props> = ({ form, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        onChange("profile_photo", f);
    }

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Customer Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                    className="input-field"
                    placeholder="Age"
                    type="number"
                    value={form.age ?? ""}
                    onChange={(e) => onChange("age", e.target.value ? Number(e.target.value) : "")}
                />
                <input
                    className="input-field"
                    placeholder="Height (cm)"
                    type="number"
                    value={form.height ?? ""}
                    onChange={(e) => onChange("height", e.target.value ? Number(e.target.value) : "")}
                />
            </div>

            <input
                className="input-field"
                placeholder="Mobile Number"
                value={form.mobile ?? ""}
                onChange={(e) => onChange("mobile", e.target.value)}
            />

            <textarea
                className="input-field"
                placeholder="Address"
                value={form.address ?? ""}
                onChange={(e) => onChange("address", e.target.value)}
            />

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                    Upload Profile Photo
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                {form.profile_photo && (
                    <div className="text-sm text-gray-600">{(form.profile_photo as File).name}</div>
                )}
            </div>
        </div>
    );
};

export default StepCustomer;

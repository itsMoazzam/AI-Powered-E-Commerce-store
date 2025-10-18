import React, { useRef } from "react";
import type { ChangeEvent } from "react";
import type { SellerForm } from "./Register";

type Props = {
    form: SellerForm;
    onChange: <K extends keyof SellerForm>(key: K, value: SellerForm[K]) => void;
    next: () => void;
    prev: () => void;
};

const StepSeller: React.FC<Props> = ({ form, onChange }) => {
    const licenseRef = useRef<HTMLInputElement | null>(null);

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        onChange("business_license", f);
    }

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Seller / Business Details</h2>

            <input
                className="input-field"
                placeholder="Store Name"
                value={form.store_name ?? ""}
                onChange={(e) => onChange("store_name", e.target.value)}
            />

            <textarea
                className="input-field"
                placeholder="Business Address"
                value={form.business_address ?? ""}
                onChange={(e) => onChange("business_address", e.target.value)}
            />

            <input
                className="input-field"
                placeholder="Website (optional)"
                type="url"
                value={form.website ?? ""}
                onChange={(e) => onChange("website", e.target.value)}
            />

            <input
                className="input-field"
                placeholder="Mobile Number"
                type="tel"
                value={form.mobile ?? ""}
                onChange={(e) => onChange("mobile", e.target.value)}
            />

            <div className="flex items-center gap-3 text-gray-500">
                <button
                    type="button"
                    className="px-3 py-2 rounded-lg border border-gray-400 hover:bg-gray-100"
                    onClick={() => licenseRef.current?.click()}
                >
                    Upload Business License
                </button>
                <input
                    ref={licenseRef}
                    type="file"
                    accept=".pdf,.jpg,.png"
                    className="hidden"
                    onChange={handleFile}
                />
                {form.business_license && (
                    <div className="text-sm text-gray-600">{(form.business_license as File).name}</div>
                )}
            </div>
        </div>
    );
};

export default StepSeller;

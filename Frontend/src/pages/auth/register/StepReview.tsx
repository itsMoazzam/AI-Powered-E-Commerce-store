import React from "react";
import type { CustomerForm, SellerForm, Role } from "./Register";

type Props = {
    role: Role;
    form: CustomerForm | SellerForm;
    prev: () => void;
    submit: () => void;
    loading: boolean;
};

function prettyValue(value: unknown) {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "object" && (value as File).name) return (value as File).name;
    return String(value);
}

const StepReview: React.FC<Props> = ({ role, form }) => {
    const baseFields: (keyof (CustomerForm | SellerForm))[] = [
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
    ];

    const customerFields: (keyof CustomerForm)[] = ["profile_photo", "age", "height", "mobile", "address"];
    const sellerFields: (keyof SellerForm)[] = [
        "store_name",
        "business_address",
        "website",
        "mobile",
        "business_license",
    ];

    const fieldsToShow = role === "seller" ? [...baseFields, ...sellerFields] : [...baseFields, ...customerFields];

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Review & Submit</h2>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-2">
                {fieldsToShow.map((k) => {
                    // Only show values that exist (do not show empty seller fields for customer and vice versa)
                    const val = (form as any)[k];
                    if (val === undefined || val === null || val === "") return null;

                    return (
                        <div key={String(k)} className="flex justify-between text-sm text-gray-700 border-b border-gray-100 pb-1">
                            <div className="capitalize">{String(k).replace(/_/g, " ")}</div>
                            <div className="text-gray-900 font-medium">{prettyValue(val)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepReview;

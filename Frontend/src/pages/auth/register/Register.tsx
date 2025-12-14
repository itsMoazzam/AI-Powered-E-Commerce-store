import React, { useState } from "react";
import StepPersonal from "./StepPersonal";
import StepCustomer from "./StepCustomer";
import StepSeller from "./StepSeller";
import StepReview from "./StepReview";
import api from "../../../lib/api";
import { Loader2 } from "lucide-react";

export type Role = "customer" | "seller";

// Shared fields
export interface CommonForm {
    username?: string;
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    role: Role;
}

// Customer-specific fields
export interface CustomerForm extends CommonForm {
    profile_photo?: File | null;
    age?: number | "";
    height?: number | "";
    address?: string;
    mobile?: string;


}

// Seller-specific fields
export interface SellerForm extends CommonForm {
    store_name?: string;
    business_address?: string;
    website?: string;
    mobile?: string;
    business_license?: File | null;
}

const Register: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [role, setRole] = useState<Role>("customer");
    const [customerForm, setCustomerForm] = useState<CustomerForm>({
        role: "customer",
        profile_photo: null,
    });
    const [sellerForm, setSellerForm] = useState<SellerForm>({
        role: "seller",
        business_license: null,
    });
    const [loading, setLoading] = useState<boolean>(false);

    const next = () => setStep((s) => Math.min(4, s + 1));
    const prev = () => setStep((s) => Math.max(1, s - 1));

    // Type-safe handlers
    const handleCustomerChange = <K extends keyof CustomerForm>(
        key: K,
        value: CustomerForm[K]
    ) => setCustomerForm((prev) => ({ ...prev, [key]: value }));

    const handleSellerChange = <K extends keyof SellerForm>(
        key: K,
        value: SellerForm[K]
    ) => setSellerForm((prev) => ({ ...prev, [key]: value }));

    // Type-safe validation
    const validateStep = (): boolean => {
        const activeForm = role === "customer" ? customerForm : sellerForm;

        if (step === 1) {
            const { username, email, password, first_name, last_name } = activeForm;

            if (!username || !email || !password || !first_name || !last_name) {
                alert("Please fill in all required fields.");
                return false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return false;
            }

            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
            if (!passwordRegex.test(password)) {
                alert(
                    "Password must include at least 8 characters, a number, and a special character."
                );
                return false;
            }
        }

        if (step === 2 && role === "customer") {
            const { address, mobile } = customerForm;
            if (!address || !mobile) {
                alert("Please complete your address and mobile number.");
                return false;
            }
        }

        if (step === 2 && role === "seller") {
            const { store_name, business_address } = sellerForm;
            if (!store_name || !business_address) {
                alert("Please provide store name and business address.");
                return false;
            }
        }

        return true;
    };

    // Submit handler
    async function submit() {
        setLoading(true);
        try {
            const payload = new FormData();
            const activeForm = role === "customer" ? customerForm : sellerForm;

            (Object.keys(activeForm) as (keyof typeof activeForm)[]).forEach((key) => {
                const value = activeForm[key];
                if (value === undefined || value === "" || value === null) return;

                if ((value as any) instanceof File) {
                    payload.append(key, value);
                } else {
                    payload.append(key, String(value));
                }
            });

            const { data } = await api.post("/api/auth/register/", payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("Registration successful:", data);
            window.location.href = "/";
        } catch (err) {
            console.error("Registration error", err);
            alert("Registration failed. Please check input and try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-50 p-6">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Create your account</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Sign up as a Customer or Seller — secure and fast.
                        </p>
                    </div>
                    <div className="text-sm text-gray-500">Step {step} / 4</div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-gray-200 rounded-full mb-6">
                    <div
                        className="h-2 bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>

                {/* Step rendering */}
                <div className="space-y-6">
                    {step === 1 && (
                        <StepPersonal
                            role={role}
                            setRole={setRole}
                            form={role === "customer" ? customerForm : sellerForm}
                            onChange={role === "customer" ? handleCustomerChange : handleSellerChange}
                            next={next}
                        />
                    )}

                    {step === 2 && role === "customer" && (
                        <StepCustomer
                            form={customerForm}
                            onChange={handleCustomerChange}
                            next={next}
                            prev={prev}
                        />
                    )}

                    {step === 2 && role === "seller" && (
                        <StepSeller
                            form={sellerForm}
                            onChange={handleSellerChange}
                            next={next}
                            prev={prev}
                        />
                    )}

                    {step === 3 && (
                        <StepReview
                            role={role}
                            form={role === "customer" ? customerForm : sellerForm}
                            prev={prev}
                            submit={submit}
                            loading={loading}
                        />
                    )}

                    <div className="pt-4 border-t border-gray-100">
                        <div className="mt-4 flex justify-between items-center">
                            <button
                                onClick={prev}
                                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                                disabled={step === 1}
                            >
                                Back
                            </button>

                            <button
                                onClick={() => {
                                    if (!validateStep()) return;
                                    if (step === 3) submit();
                                    else next();
                                }}
                                className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin inline-block w-4 h-4" />
                                ) : step === 3 ? (
                                    "Create Account"
                                ) : (
                                    "Next"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

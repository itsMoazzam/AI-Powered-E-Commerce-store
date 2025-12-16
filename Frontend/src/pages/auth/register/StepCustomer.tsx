import React, { useRef, useState, useEffect } from "react";
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
    const [feet, setFeet] = useState<string>("")
    const [inches, setInches] = useState<string>("")

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        onChange("profile_photo", f);
    }

    // sync local feet/inches when parent form.height (cm) changes
    useEffect(() => {
        const h = form.height
        if (h === null || h === undefined || h === "") {
            setFeet("")
            setInches("")
            return
        }

        const cm = Number(h)
        if (!isFinite(cm) || cm <= 0) {
            setFeet("")
            setInches("")
            return
        }

        const totalInches = cm / 2.54
        let f = Math.floor(totalInches / 12)
        let i = Math.round(totalInches - f * 12)
        if (i === 12) {
            f += 1
            i = 0
        }
        setFeet(String(f))
        setInches(String(i))
    }, [form.height])

    const updateHeightFromParts = (fStr: string, iStr: string) => {
        const f = fStr === "" ? NaN : Number(fStr)
        const i = iStr === "" ? NaN : Number(iStr)
        if (!isFinite(f) && !isFinite(i)) {
            onChange("height", "")
            return
        }
        const feetVal = isFinite(f) ? f : 0
        const inchesVal = isFinite(i) ? i : 0
        const totalInches = feetVal * 12 + inchesVal
        const cm = totalInches * 2.54
        onChange("height", Number(cm.toFixed(2)))
    }

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Customer Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
                <input
                    className="input-field"
                    placeholder="Age"
                    type="number"
                    value={form.age ?? ""}
                    onChange={(e) => onChange("age", e.target.value ? Number(e.target.value) : "")}
                />
                <div className="flex gap-2 items-center">
                    <label className="sr-only">Height feet</label>
                    <input
                        className="input-field w-24"
                        placeholder="Height ft"
                        type="number"
                        min={0}
                        value={feet}
                        onChange={(e) => {
                            const v = e.target.value
                            // allow empty or integer values
                            if (v === "" || /^\d*$/.test(v)) {
                                setFeet(v)
                                updateHeightFromParts(v, inches)
                            }
                        }}
                    />
                    <label className="sr-only">Height inches</label>
                    <input
                        className="input-field w-24"
                        placeholder="Height inches"
                        type="number"
                        min={0}
                        max={11}
                        value={inches}
                        onChange={(e) => {
                            const v = e.target.value
                            if (v === "" || /^\d*$/.test(v)) {
                                setInches(v)
                                updateHeightFromParts(feet, v)
                            }
                        }}
                    />
                </div>
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

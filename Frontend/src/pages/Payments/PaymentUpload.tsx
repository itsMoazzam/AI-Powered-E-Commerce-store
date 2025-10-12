import { useState } from "react"
import { uploadPayment } from "../../lib/payment"

export default function PaymentUpload() {
    const [file, setFile] = useState<File | null>(null)
    const [status, setStatus] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            setStatus("Please select a file first")
            return
        }

        const formData = new FormData()
        formData.append("screenshot", file)
        formData.append("bank", "HBL")
        formData.append("txn_id", "TXN123")
        formData.append("amount", "5000")

        try {
            const res = await uploadPayment(formData)
            setStatus(`Uploaded successfully, status: ${res.status}`)
        } catch {
            setStatus("Upload failed")
        }
    }

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Upload Payment Proof</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded" type="submit">
                    Upload
                </button>
            </form>
            {status && <p className="mt-4 text-gray-700">{status}</p>}
        </div>
    )
}

import { useEffect, useState } from "react"
import { listPayments, adminAction } from "../../lib/payment"
import type { Payment } from "../../lib/payment"

export default function AdminPayments() {
    const [payments, setPayments] = useState<Payment[]>([])

    useEffect(() => {
        listPayments().then((res) => setPayments(res))
    }, [])

    const handleAction = async (id: number, action: "approve" | "reject") => {
        const res = await adminAction(id, action)
        setPayments((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: res.status } : p))
        )
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Admin Payments</h2>
            <div className="grid gap-4">
                {payments.map((p) => (
                    <div key={p.id} className="p-4 border rounded bg-white shadow">
                        <p><b>User:</b> {p.user}</p>
                        <p><b>Amount:</b> {p.amount}</p>
                        <p><b>Status:</b> {p.status}</p>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => handleAction(p.id, "approve")}
                                className="px-3 py-1 bg-green-600 text-white rounded"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleAction(p.id, "reject")}
                                className="px-3 py-1 bg-red-600 text-white rounded"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

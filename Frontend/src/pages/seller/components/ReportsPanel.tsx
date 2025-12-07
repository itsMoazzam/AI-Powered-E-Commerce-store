
// FILE: src/pages/seller/components/ReportsPanel.tsx
import { exportToCSV, exportToPDF } from "../utils/export"

interface Payment {
    // define the properties of a payment object
    id: string;
    amount: number;
    date: string;
    // add other relevant fields
}

interface Review {
    // define the properties of a review object
    id: string;
    rating: number;
    comment: string;
    date: string;
    // add other relevant fields
}

interface System {
    // define the properties of a system object
    id: string;
    name: string;
    status: string;
    // add other relevant fields
}

interface Product {
    // define the properties of a product object
    id: string;
    name: string;
    price: number;
    // add other relevant fields
}

interface ReportsPanelProps {
    payments?: Payment[];
    reviews?: Review[];
    systems?: System[];
    products?: Product[];
}

export default function ReportsPanel({ payments = [], reviews = [], systems = [], products = [] }: ReportsPanelProps) {
    return (
        <div className="card p-6 bg-white dark:bg-zinc-950 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-3">Exportable Reports</h3>
            <p className="text-sm text-zinc-500 mb-4">Generate audit logs, OCR verification reports and moderation history. Files will include timestamps and admin action metadata.</p>
            <div className="flex gap-3">
                <button className="btn-primary p-1" onClick={() => exportToPDF({ payments, reviews, systems, products }, 'audit-report.pdf')}>Export PDF (Audit)</button>
                <button className="btn-outline p-1" onClick={() => exportToCSV('payments.csv', payments.map(payment => ({ ...payment })))}>Export Payments CSV</button>
                <button className="btn-outline p-1" onClick={() => exportToCSV('reviews.csv', reviews.map(review => ({ ...review })))}>Export Reviews CSV</button>
            </div>
        </div>
    )
}


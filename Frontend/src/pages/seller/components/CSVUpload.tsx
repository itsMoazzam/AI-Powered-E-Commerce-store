import { useState } from "react"
import Papa from "papaparse"
import api from "../../../lib/api"
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react"

interface CSVUploadProps {
    onImported?: (data: Record<string, string>[]) => void
}

export default function CSVUpload({ onImported }: CSVUploadProps) {
    const [file, setFile] = useState<File | null>(null)
    const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([])
    const [loading, setLoading] = useState(false)

    // 🔹 Handle CSV File Selection & Preview
    function handleFile(f: File | null) {
        setFile(f)
        setPreviewRows([])
        if (!f) return

        Papa.parse<Record<string, string>>(f, {
            header: true,
            skipEmptyLines: true,
            complete: (res) => {
                setPreviewRows(res.data)
            },
            error: (err) => {
                console.error("❌ CSV parse failed:", err)
                alert("CSV parsing failed. Please check your file format.")
            },
        })
    }

    // 🔹 Upload CSV to Backend
    async function importCSV() {
        if (!file) return alert("Select a CSV file first.")
        if (!confirm("Import CSV and create products?")) return

        setLoading(true)
        try {
            const form = new FormData()
            form.append("file", file)

            // ✅ Backend endpoint for bulk product creation
            const { data } = await api.post("/api/seller/products/bulk/", form, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            onImported?.(data)
            alert("✅ CSV imported successfully!")
        } catch (err) {
            console.error("❌ Import failed:", err)
            alert("Failed to import CSV. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <FileSpreadsheet className="text-indigo-600" />
                <h3 className="text-lg font-semibold text-zinc-800">
                    Bulk Upload (CSV)
                </h3>
            </div>

            {/* File Upload + Button */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(e) => handleFile(e.target.files?.[0] || null)}
                        className="border border-zinc-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
                    />
                    <button
                        disabled={!file || loading}
                        onClick={importCSV}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-60"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Upload size={16} />
                        )}
                        {loading ? "Importing..." : "Import CSV"}
                    </button>
                </div>

                {/* CSV Preview Table */}
                <div>
                    <div className="text-sm text-zinc-600 mb-2">Preview (first 5 rows)</div>
                    <div className="overflow-auto border border-zinc-200 rounded-lg max-h-56 bg-zinc-50">
                        {previewRows.length === 0 ? (
                            <div className="text-sm text-zinc-400 p-4 text-center">
                                No preview yet
                            </div>
                        ) : (
                            <table className="min-w-full text-sm text-zinc-700">
                                <thead className="bg-zinc-100 text-zinc-800 font-medium sticky top-0">
                                    <tr>
                                        {Object.keys(previewRows[0]).map((key) => (
                                            <th
                                                key={key}
                                                className="px-3 py-2 border-b border-zinc-200 text-left"
                                            >
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewRows.slice(0, 5).map((row, i) => (
                                        <tr key={i} className="odd:bg-white even:bg-zinc-50">
                                            {Object.keys(row).map((k) => (
                                                <td
                                                    key={k}
                                                    className="px-3 py-2 border-b border-zinc-100 truncate max-w-xs"
                                                >
                                                    {row[k]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

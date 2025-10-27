// optional - modal wrapper for editing (not strictly required since ProductForm supports edit)

export default function ProductEditModal({ children, onClose }: any) {
    return (
        <div className="fixed inset-0 z-50 flex  justify-center bg-black/80 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl overflow-auto">
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="font-semibold text-gray-600">Edit Product</div>
                    <button onClick={onClose} className="px-3 py-1 text-gray-600">Close</button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    )
}

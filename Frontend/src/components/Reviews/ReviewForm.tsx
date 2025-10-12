import React, { useState } from "react";
import { submitReview } from "../../lib/reviews";

interface Props {
    productId: number;
}

const ReviewForm: React.FC<Props> = ({ productId }) => {
    const [text, setText] = useState("");
    const [rating, setRating] = useState(5);
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("product", String(productId));
        formData.append("text", text);
        formData.append("rating", String(rating));
        if (file) formData.append("media", file);

        await submitReview(formData);
        setText("");
        setRating(5);
        setFile(null);
        alert("Review submitted, pending moderation!");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-3 border rounded-md">
            <h2 className="text-lg font-semibold">Leave a Review</h2>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Write your review..."
            />
            <input
                type="number"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                min={1}
                max={5}
                className="border p-1 rounded"
            />
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Submit Review
            </button>
        </form>
    );
};

export default ReviewForm;

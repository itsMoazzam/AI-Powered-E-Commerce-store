import React, { useEffect, useState } from "react";
import { fetchReviews } from "../../lib/reviews";
import type { Review } from "../../lib/reviews";

interface Props {
    productId: number;
}

const ReviewList: React.FC<Props> = ({ productId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        fetchReviews(productId).then(setReviews);
    }, [productId]);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Customer Reviews</h2>
            {reviews.map((r) => (
                <div key={r.id} className="border p-3 rounded-md shadow-sm">
                    <p className="font-bold">{r.user}</p>
                    {r.rating && <p>Rating: ⭐ {r.rating}/5</p>}
                    <p>{r.text}</p>
                    {r.media && <img src={r.media} alt="review" className="max-h-40 mt-2" />}
                    <p className="text-sm text-gray-500">{new Date(r.created).toLocaleString()}</p>
                </div>
            ))}
            {reviews.length === 0 && <p>No reviews yet.</p>}
        </div>
    );
};

export default ReviewList;

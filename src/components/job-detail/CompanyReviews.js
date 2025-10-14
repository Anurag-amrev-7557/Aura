"use client";

export default function CompanyReviews({ reviews, rating }) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300 fill-gray-300"
        }`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Employee Reviews</h2>
        <p className="text-sm text-[var(--foreground)]/60">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Employee Reviews</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">{renderStars(rating || 4.2)}</div>
          <span className="text-sm font-semibold">{rating || 4.2}</span>
          <span className="text-sm text-[var(--foreground)]/60">
            ({reviews.length} reviews)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.slice(0, 3).map((review, index) => (
          <div key={index} className="pb-4 border-b border-[var(--border)] last:border-0 last:pb-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-medium text-sm">{review.role}</div>
                <div className="text-xs text-[var(--foreground)]/60">{review.date}</div>
              </div>
              <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
            </div>
            <p className="text-sm text-[var(--foreground)]/80 line-clamp-3">
              {review.comment}
            </p>

            {review.pros && (
              <div className="mt-2">
                <span className="text-xs font-semibold text-green-600">Pros: </span>
                <span className="text-xs text-[var(--foreground)]/70">{review.pros}</span>
              </div>
            )}
            {review.cons && (
              <div className="mt-1">
                <span className="text-xs font-semibold text-red-600">Cons: </span>
                <span className="text-xs text-[var(--foreground)]/70">{review.cons}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="w-full mt-4 text-sm text-[var(--accent)] hover:underline font-medium">
        View All Reviews
      </button>
    </div>
  );
}

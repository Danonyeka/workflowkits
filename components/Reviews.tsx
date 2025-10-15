// components/Reviews.tsx
"use client";

import { useEffect, useState } from "react";

type Review = { name: string; text: string; rating?: number };

export default function Reviews({
  slug,
  testimonials,
}: {
  slug: string;
  testimonials: Review[];
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/reviews-data?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.ok) setReviews(data.reviews || []);
      } catch {}
    })();
  }, [slug]);

  const merged = [...(testimonials || []), ...reviews];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Customer Reviews</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {merged.length === 0 ? (
          <div className="text-sm text-gray-500">No reviews yet.</div>
        ) : (
          merged.map((t, i) => (
            <blockquote key={i} className="p-4 bg-gray-50 rounded-xl">
              <p>“{t.text}”</p>
              <div className="text-sm text-gray-500">
                — {t.name}{t.rating ? ` • ${t.rating}★` : ""}
              </div>
            </blockquote>
          ))
        )}
      </div>

      <div className="mt-2 p-4 border rounded-xl">
        <h3 className="font-semibold mb-2">Add your review</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            className="border rounded p-2"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="border rounded p-2"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} stars
              </option>
            ))}
          </select>
          <textarea
            className="border rounded p-2 sm:col-span-2"
            rows={3}
            placeholder="Share your experience"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button
          className="mt-3 brand-btn"
          onClick={async () => {
            if (!name || !text) return alert("Please fill name and review");
            const res = await fetch("/api/reviews", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug, name, text, rating }),
            });
            const data = await res.json();
            if (data.ok) {
              setReviews((v) => [...v, { name, text, rating }]);
              setName("");
              setText("");
              setRating(5);
            } else {
              alert(data.error || "Error");
            }
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

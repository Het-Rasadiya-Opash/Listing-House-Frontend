/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import apiRequest from "../utils/apiRequest";

interface ReviewFormProps {
  listingId?: string;
  onReviewAdded?: () => void;
}

const ReviewForm = ({ listingId, onReviewAdded }: ReviewFormProps) => {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    comment: "",
    rating: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await apiRequest.post(`/review/create/${listingId}`, formData);
      setFormData({ comment: "", rating: "" });
      onReviewAdded?.();
    } catch (err: any) {
      setError(err.response?.data?.message);
    }
  };

  return (
    <div className="bg-transparent">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="comment"
            className="block text-[15px] font-medium text-gray-800 mb-2"
          >
            Comment
          </label>
          <textarea
            name="comment"
            id="comment"
            value={formData.comment}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition text-gray-700"
            placeholder="Share your experience..."
            required
          />
        </div>
        <div>
          <label
            htmlFor="rating"
            className="block text-[15px] font-medium text-gray-800 mb-2"
          >
            Rating (1-5)
          </label>
          <input
            name="rating"
            id="rating"
            type="number"
            min="1"
            max="5"
            value={formData.rating}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition text-gray-700"
            placeholder="Enter rating (1-5)"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-3.5 px-4 rounded-xl hover:bg-primary-dark transition duration-200 font-semibold active:scale-[0.98]"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
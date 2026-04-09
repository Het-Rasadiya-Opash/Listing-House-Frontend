import { useState } from "react";
import ReviewForm from "./ReviewForm";
import useAuthStore from "../utils/authStore";
import AllReview from "./AllReview";

const ReviewContainer = ({ id }: { id: string }) => {
  const { currentUser } = useAuthStore();
  const [reviewRefresh, setReviewRefresh] = useState(0);

  return (
    <>
      <div className="mt-12 py-12 border-t border-gray-200">
        <h2 className="text-[22px] font-semibold text-gray-900 mb-8">
          Reviews
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {currentUser && (
            <div className="bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Leave a Review
              </h3>
              <ReviewForm
                listingId={id}
                onReviewAdded={() => setReviewRefresh((prev) => prev + 1)}
              />
            </div>
          )}

          <div className="bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              All Reviews
            </h3>
            <AllReview listingId={id} refreshTrigger={reviewRefresh} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewContainer;
import { useNavigate } from "react-router-dom";
import { Heart, Trash2, Star } from "lucide-react";
import useAuthStore from "../utils/authStore";
import apiRequest from "../utils/apiRequest";
import { useState, useEffect } from "react";

interface ListingProps {
  listing: {
    _id: string;
    title: string;
    images: string[];
    price?: number;
    location?: string;
    owner?: { _id: string; username?: string; email?: string };
  };
  onDelete?: (listingId: string) => void;
}

const Listing = ({ listing, onDelete }: ListingProps) => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!currentUser) return;
      try {
        const response = await apiRequest.get(
          `/like/check?listingId=${listing._id}&userId=${currentUser._id}`,
        );
        setIsLiked(response.data.liked);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchRating = async () => {
      try {
        const response = await apiRequest.get(`/review/${listing._id}`);
        const reviews = response.data.data;
        if (reviews && reviews.length > 0) {
          const avg =
            reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) /
            reviews.length;
          setAvgRating(Number(avg.toFixed(1)));
        }
      } catch (error) {
        console.log("Failed to fetch reviews for rating", error);
      }
    };

    if (listing?._id) {
      checkLikeStatus();
      fetchRating();
    }
  }, [listing?._id, currentUser]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiRequest.post("/like", {
        listingId: listing._id,
        userId: currentUser?._id,
      });

      setIsLiked(response.data.liked);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      onClick={() => navigate(`/listing/${listing._id}`)}
      className="group cursor-pointer flex flex-col w-full"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl mb-3">
        <img
          src={listing?.images[0] || "/placeholder-image.jpg"}
          alt={listing?.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500 ease-out"
        />

        {currentUser && (
          <div className="absolute top-3 right-3 text-white z-10">
            <button
              onClick={handleLike}
              className="hover:scale-110 transition active:scale-95 drop-shadow-md"
            >
              <Heart
                className={
                  isLiked
                    ? "text-primary fill-primary"
                    : "text-white fill-black/40"
                }
                size={26}
                strokeWidth={isLiked ? 1 : 1.5}
              />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col relative line-height-relaxed">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-[15px] text-gray-900 line-clamp-1">
            {listing.location || "Location unlisted"}
          </h3>
          {avgRating && (
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Star size={14} className="fill-gray-900 text-gray-900" />
              <span className="text-[15px] text-gray-900 font-light">
                {avgRating}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-[2px]">
          <p className="text-gray-500 font-normal text-[15px] line-clamp-1">
            {listing.title}
          </p>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(listing._id);
              }}
              className="p-1 hover:bg-red-50 text-red-500 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0 ml-2"
              title="Delete Listing"
            >
              <Trash2 size={15} strokeWidth={2} />
            </button>
          )}
        </div>

        <p className="text-gray-500 font-normal text-[15px] line-clamp-1 mb-1">
          Stay with {listing.owner?.username || "Host"}
        </p>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-semibold text-[15px] text-gray-900">
            ₹{listing.price?.toLocaleString()}
          </span>
          <span className="font-normal text-[15px] text-gray-900"> night</span>
        </div>
      </div>
    </div>
  );
};

export default Listing;
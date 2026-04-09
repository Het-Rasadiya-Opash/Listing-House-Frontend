import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import useAuthStore from "../utils/authStore";
import Map from "../components/Map";
import ReviewContainer from "../components/ReviewContainer";
import ConfirmModal from "../components/ConfirmModal";
import { Heart, MapPin, DoorOpen, Star } from "lucide-react";

interface ReviewData {
  _id: string;
  comment: string;
  rating: number;
}

const ListingPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingRes, reviewsRes] = await Promise.all([
          apiRequest.get(`/listing/${id}`),
          apiRequest.get(`/review/${id}`),
        ]);

        setListing(listingRes.data.data);
        setReviews(reviewsRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch listing data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!currentUser || !id) return;
      try {
        const response = await apiRequest.get(
          `/like/check?listingId=${id}&userId=${currentUser._id}`,
        );
        setIsLiked(response.data.liked);
      } catch (error) {
        console.log("Failed to fetch like status:", error);
      }
    };
    checkLikeStatus();
  }, [id, currentUser]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    try {
      const response = await apiRequest.post("/like", {
        listingId: id,
        userId: currentUser._id,
      });
      setIsLiked(response.data.liked);
    } catch (error) {
      console.log("Failed to toggle like:", error);
    }
  };

  const handleDeleteListing = async () => {
    try {
      await apiRequest.delete(`/listing/${id}`);
      navigate("/profile");
    } catch (error) {
      console.error("Failed to delete listing:", error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center flex-col items-center h-[70vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
        <p className="text-gray-500 font-medium tracking-wide">
          Loading listing...
        </p>
      </div>
    );

  if (!listing)
    return (
      <div className="flex justify-center items-center h-[70vh] text-2xl font-semibold text-gray-700">
        Listing not found
      </div>
    );

  const isOwner = currentUser?._id === listing.owner?._id;

  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? (
        reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount
      ).toFixed(1)
      : 0;

  return (
    <div className="max-w-7xl mx-auto xl:px-20 md:px-10 sm:px-4 px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] md:text-3xl font-semibold leading-tight text-gray-900 mb-1">
            {listing.title}
          </h1>
          <div className="flex flex-wrap items-center text-sm text-gray-700 gap-2 font-medium">
            {reviewCount > 0 && (
              <>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-gray-900" />
                  <span>{avgRating}</span>
                </div>
                <span>·</span>
                <span className="underline cursor-pointer">
                  {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </span>
                <span>·</span>
              </>
            )}
            <span className="flex items-center gap-1 underline cursor-pointer">
              <MapPin size={14} />
              {listing.location || "Location unlisted"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition active:scale-95"
          >
            <Heart
              size={16}
              className={isLiked ? "fill-primary text-primary" : ""}
              strokeWidth={isLiked ? 1 : 2}
            />
            {isLiked ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div className="mb-12">
        {listing.images && listing.images.length > 0 ? (
          <div
            className={`grid gap-2 ${listing.images.length === 1
              ? "grid-cols-1 h-100 md:h-125"
              : listing.images.length === 2
                ? "grid-cols-1 md:grid-cols-2 h-100 md:h-125"
                : listing.images.length === 3
                  ? "grid-cols-1 md:grid-cols-3 h-100 md:h-125"
                  : listing.images.length === 4
                    ? "grid-cols-1 md:grid-cols-2 gap-2 auto-rows-[200px] md:auto-rows-[250px]"
                    : "grid-cols-1 md:grid-cols-4 gap-2 auto-rows-[200px] md:auto-rows-[250px]"
              }`}
          >
            {listing.images.map((img: string, index: number) => {
              let spanClass = "";
              if (listing.images.length >= 5) {
                spanClass = index === 0 ? "md:col-span-2 md:row-span-2" : "";
              }
              return (
                <div
                  key={index}
                  className={`rounded-xl overflow-hidden w-full h-full ${spanClass}`}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer"
                    alt={`Listing image ${index + 1}`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-100 md:h-125gray-200 flex items-center justify-center text-gray-400 rounded-xl">
            No images available
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
        <div className="col-span-1 lg:col-span-2">
          <div className="pb-6 border-b border-gray-200">
            <h2 className="text-[22px] font-semibold text-gray-900 mb-1">
              {listing.category || "Entire home"} in {listing.location}
            </h2>

            <div className="flex items-center gap-4 mt-4">
              <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-xl uppercase">
                {listing.owner?.username?.charAt(0) || "H"}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Hosted by {listing.owner?.username || "Host"}
                </p>
                <p className="text-gray-500 text-sm">
                  {listing.owner?.email || ""}
                </p>
              </div>
            </div>
          </div>

          <div className="py-6 border-b border-gray-200 space-y-6">
            <div className="flex gap-4">
              <DoorOpen size={28} className="text-gray-800 shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Self check-in</h3>
                <p className="text-gray-500 text-sm">
                  Check yourself in with the lockbox.
                </p>
              </div>
            </div>

            {reviewCount > 0 && Number(avgRating) >= 4.8 && (
              <div className="flex gap-4">
                <Star size={28} className="text-gray-800 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Highly rated Host
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Host has received highly positive ratings from recent
                    guests.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="py-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              About this space
            </h2>
            <p className="text-gray-700 leading-relaxed font-normal whitespace-pre-line">
              {listing.description ||
                "Enjoy a wonderful stay at this beautiful property. Highly recommended for short and long terms stays."}
            </p>
          </div>

          {(isOwner) && (
            <div className="py-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Manage Listing
              </h2>
              <div className="flex gap-4">
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition border border-gray-300">
                    Edit Listing
                  </button>
                </Link>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-6 py-2.5 bg-white hover:bg-red-50 text-red-600 font-semibold rounded-lg border border-red-200 transition"
                >
                  Delete Listing
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-1 border-t lg:border-t-0 pt-8 lg:pt-0">
          <div className="sticky top-28 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl w-full">
            <div className="flex justify-between items-baseline mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                ₹{listing.price?.toLocaleString()}
                <span className="text-base font-normal text-gray-600">
                  {" "}
                  night
                </span>
              </h2>
            </div>

            {!isOwner && !currentUser?.admin ? (
              <Link to={`/booking/${listing._id}`} className="block w-full">
                <button className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition duration-200 text-lg">
                  Reserve
                </button>
              </Link>
            ) : (
              <button
                disabled
                className="w-full py-3.5 bg-gray-200 text-gray-500 font-semibold rounded-xl cursor-not-allowed text-lg"
              >
                Cannot reserve own listing
              </button>
            )}

            <div className="text-center mt-4 text-gray-500 text-sm">
              You won't be charged yet
            </div>
          </div>
        </div>
      </div>

      {listing.geometry?.coordinates && (
        <div className="mt-12 py-12  border-gray-200">
          <h2 className="text-[22px] font-semibold text-gray-900 mb-6">
            Where you'll be
          </h2>
          <div className="rounded-xl overflow-hidden shadow-sm h-100">
            <Map
              latitude={listing.geometry.coordinates[1]}
              longitude={listing.geometry.coordinates[0]}
              title={listing.title}
            />
          </div>
        </div>
      )}

      <ReviewContainer id={id!} />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteListing}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
      />
    </div>
  );
};

export default ListingPage;
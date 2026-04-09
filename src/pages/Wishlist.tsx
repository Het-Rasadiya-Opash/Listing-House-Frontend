/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import useAuthStore from "../utils/authStore";
import apiRequest from "../utils/apiRequest";
import Listing from "../components/Listing";
import { Heart } from "lucide-react";

const Wishlist = () => {
  const { currentUser } = useAuthStore();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchWishlist = async () => {
      try {
        const response = await apiRequest.get(
          `/like/user?userId=${currentUser._id}`,
        );
        setWishlist(response.data);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">
            Please log in to view your wishlist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto xl:px-20 md:px-10 sm:px-4 px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Wishlist
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="py-12">
            <h2 className="text-[22px] font-semibold text-gray-900 mb-2">
              Create your first wishlist
            </h2>
            <p className="text-gray-500 text-[15px] font-normal mb-6">
              As you search, tap the heart icon to save your favorite places and
              Experiences to a wishlist.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map(
              (item: any) =>
                item.listing && (
                  <Listing key={item._id} listing={item.listing} />
                ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
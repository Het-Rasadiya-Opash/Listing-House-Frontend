import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import { ChevronLeft, Star, Loader2, Users, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const BookingForm = () => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [listing, setListing] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { listingId } = useParams();
  const navigate = useNavigate();

  // Derived state for cost calculation
  const [nights, setNights] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const [listingRes, reviewsRes] = await Promise.all([
          apiRequest.get(`/listing/${listingId}`),
          apiRequest.get(`/review/${listingId}`),
        ]);
        setListing(listingRes.data.data);
        setReviews(reviewsRes.data.data || []);
      } catch (error: any) {
        setError(
          error.response?.data?.message || "Failed to load listing details.",
        );
      }
    };
    fetchListing();
  }, [listingId]);

  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setNights(daysDiff > 0 ? daysDiff : 0);
    } else {
      setNights(0);
    }
  }, [checkIn, checkOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut || guests < 1) {
      setError("Please fill in all fields correctly.");
      return;
    }
    if (nights <= 0) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await apiRequest.post(`/booking/${listingId}`, {
        checkIn,
        checkOut,
        guests,
      });
      toast.success("Booking confirmed successfully!");
      navigate("/profile");
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Booking failed. Please try again.",
      );
      toast.error("Booking failed!");
    } finally {
      setIsLoading(false);
    }
  };

  if (!listing && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">
          Preparing your booking...
        </h2>
      </div>
    );
  }

  const basePrice = listing?.price || 0;
  const totalCost = basePrice * nights;
  const cleaningFee = 0; // hide actual cleaning fee cost
  const serviceFee = 0; // hide actual service fee cost
  const finalTotal = totalCost; // total is based on nights only

  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Top Navigation */}
      <div className="md:hidden sticky top-0 bg-white z-10 px-4 py-4 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-gray-900">Confirm and pay</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="hidden md:block mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center p-2 -ml-2 text-gray-900 hover:bg-gray-100 rounded-full w-max transition-colors mb-6"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
            Confirm and pay
          </h1>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-12 lg:gap-24 relative">
          {/* Left Column - Form & Details */}
          <div className="w-full md:w-[55%]">
            <div className="bg-white rounded-2xl md:rounded-none md:p-0 p-6 mb-8 md:mb-0 shadow-sm md:shadow-none border border-gray-200 md:border-transparent">
              <h2 className="text-2xl font-semibold mb-6">Your trip</h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Dates */}
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-medium text-lg text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Dates
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group flex flex-col bg-white p-3 rounded-xl border border-gray-400 focus-within:ring-2 focus-within:ring-black focus-within:border-black transition-all hover:bg-gray-50">
                      <label
                        htmlFor="checkIn"
                        className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 cursor-pointer"
                      >
                        Check-in
                      </label>
                      <input
                        type="date"
                        id="checkIn"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full bg-transparent text-gray-900 outline-none text-sm md:text-base font-medium cursor-pointer"
                        required
                      />
                    </div>
                    <div className="group flex flex-col bg-white p-3 rounded-xl border border-gray-400 focus-within:ring-2 focus-within:ring-black focus-within:border-black transition-all hover:bg-gray-50">
                      <label
                        htmlFor="checkOut"
                        className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 cursor-pointer"
                      >
                        Checkout
                      </label>
                      <input
                        type="date"
                        id="checkOut"
                        value={checkOut}
                        min={checkIn || undefined}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full bg-transparent text-gray-900 outline-none text-sm md:text-base font-medium cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Guests */}
                <div className="pt-8 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-medium text-lg text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Guests
                    </h3>
                  </div>
                  <div className="group flex flex-col bg-white p-3 rounded-xl border border-gray-400 focus-within:ring-2 focus-within:ring-black focus-within:border-black transition-all hover:bg-gray-50">
                    <label
                      htmlFor="guests"
                      className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 cursor-pointer"
                    >
                      Number of guests
                    </label>
                    <select
                      id="guests"
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full bg-transparent text-gray-900 outline-none text-sm md:text-base font-medium cursor-pointer appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "guest" : "guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="pt-8 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                    By selecting the button below, I agree to the Host's House
                    Rules, Ground rules for guests, Airbnb's Rebooking and
                    Refund Policy, and that Airbnb can charge my payment method
                    if I'm responsible for damage.
                  </p>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto px-10 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                  >
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isLoading ? "Confirming..." : "Confirm and pay"}
                  </button>
                  <p className="text-gray-500 text-sm mt-4 text-center md:text-left font-medium">
                    You won't be charged yet
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Listing Summary Card */}
          <div className="w-full md:w-[45%]">
            <div className="md:sticky md:top-28 bg-white border border-gray-300 rounded-2xl p-6 shadow-xl shadow-gray-200/50">
              {/* Listing Header */}
              <div className="flex gap-4 pb-6 border-b border-gray-200">
                <img
                  src={
                    listing?.images?.[0] ||
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80"
                  }
                  alt={listing?.title}
                  className="w-28 h-24 object-cover rounded-xl"
                />
                <div className="flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="text-xs text-gray-500 mb-1 line-clamp-1">
                      {listing?.location || "Entire home"}
                    </h3>
                    <h2 className="text-gray-900 font-medium leading-tight text-sm line-clamp-2">
                      {listing?.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-900 font-medium mt-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{reviewCount > 0 ? avgRating : "New"}</span>
                    {reviewCount > 0 && (
                      <span className="text-gray-500 ml-1">
                        ({reviewCount}{" "}
                        {reviewCount === 1 ? "review" : "reviews"})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="pt-6">
                <h2 className="text-xl font-semibold mb-5">Price details</h2>

                <div className="space-y-4 text-gray-700 text-[15px]">
                  {nights > 0 ? (
                    <div className="flex justify-between items-center">
                      <span className="underline decoration-gray-300 hover:text-black cursor-pointer">
                        ₹{basePrice.toLocaleString()} x {nights}{" "}
                        {nights === 1 ? "night" : "nights"}
                      </span>
                      <span>₹{totalCost.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-gray-500">
                      <span>₹{basePrice.toLocaleString()} / night</span>
                      <span>Select dates</span>
                    </div>
                  )}

                  {nights > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="underline decoration-gray-300 hover:text-black cursor-pointer">
                          Cleaning fee
                        </span>
                        <span>Included</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="underline decoration-gray-300 hover:text-black cursor-pointer">
                          Service fee
                        </span>
                        <span>Included</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 pt-5 border-t border-gray-200">
                  <div className="flex justify-between items-center font-bold text-gray-900 text-lg">
                    <span>Total (INR)</span>
                    <span>
                      ₹{nights > 0 ? finalTotal.toLocaleString() : "--"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
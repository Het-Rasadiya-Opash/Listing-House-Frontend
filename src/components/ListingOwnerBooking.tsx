import { useEffect, useState } from "react";
import apiRequest from "../utils/apiRequest";
import { ChevronDown, Trash2, Calendar, User, Mail, LogIn, LogOut, IndianRupee } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

const ListingOwnerBooking = () => {
  const [listingBooking, setListingBooking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    bookingId: string;
  }>({ isOpen: false, bookingId: "" });

  useEffect(() => {
    const fetchAllBookingByOnwer = async () => {
      try {
        const response = await apiRequest.get("/booking/all");
        setListingBooking(response.data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBookingByOnwer();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await apiRequest.put("/booking/status", {
        bookingId,
        status: newStatus,
      });
      setListingBooking((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: newStatus }
            : booking,
        ),
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await apiRequest.delete("/booking/delete", {
        data: { bookingId },
      });
      setListingBooking((prev) =>
        prev.filter((booking) => booking._id !== bookingId),
      );
    } catch (error) {
      console.error("Failed to delete booking:", error);
    }
    setConfirmDelete({ isOpen: false, bookingId: "" });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-red-50 p-2 sm:p-2.5 rounded-xl shadow-sm border border-red-100 shrink-0">
            <Calendar size={20} className="text-primary sm:w-5.5 sm:h-5.5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
              Listing Bookings
            </h2>
            {!loading && (
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Total: {listingBooking.length}{" "}
                {listingBooking.length === 1 ? "Booking" : "Bookings"}
              </p>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : listingBooking.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
          <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
          <h2 className="text-[18px] font-semibold text-gray-900 mb-1">
            No bookings yet
          </h2>
          <p className="text-gray-500 text-[14px]">
            When guests book your properties, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {listingBooking.map((booking: any) => (
            <div
              key={booking._id}
              className="border-b border-gray-200 pb-8 last:border-0 last:pb-0"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-48 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={booking.listing?.images?.[0] || "/placeholder.jpg"}
                    alt={booking.listing?.title || "Listing"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {booking.listing?.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-gray-500 font-normal">
                        <span>{booking.listing?.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[13px] font-semibold capitalize ${
                          booking.isPaid
                            ? "bg-green-50 text-green-700"
                            : booking.status === "confirmed"
                              ? "bg-green-50 text-green-700"
                              : booking.status === "pending"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-red-50 text-red-700"
                        }`}
                      >
                        {booking.isPaid ? "Paid" : booking.status}
                      </span>

                      {!booking.isPaid && (
                        <div className="relative group">
                          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200">
                            <ChevronDown size={18} className="text-gray-600" />
                          </button>
                          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden py-2">
                            <button
                              onClick={() =>
                                handleStatusChange(booking._id, "confirmed")
                              }
                              className="w-full text-left px-5 py-2.5 text-[15px] hover:bg-gray-50 font-medium transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(booking._id, "pending")
                              }
                              className="w-full text-left px-5 py-2.5 text-[15px] hover:bg-gray-50 font-medium transition-colors"
                            >
                              Set Pending
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(booking._id, "cancelled")
                              }
                              className="w-full text-left px-5 py-2.5 text-[15px] hover:bg-red-50 text-red-600 font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-6 text-[15px]">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg shrink-0">
                        <User size={14} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5 font-normal">Guest</p>
                        <p className="font-medium text-gray-900">{booking.customer?.username || "N/A"}</p>
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                          <Mail size={11} className="shrink-0" />
                          {booking.customer?.email || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 p-1.5 bg-green-50 rounded-lg shrink-0">
                        <LogIn size={14} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5 font-normal">Check-in</p>
                        <p className="font-medium text-gray-900">
                          {new Date(booking.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 p-1.5 bg-red-50 rounded-lg shrink-0">
                        <LogOut size={14} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5 font-normal">Check-out</p>
                        <p className="font-medium text-gray-900">
                          {new Date(booking.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 p-1.5 bg-emerald-50 rounded-lg shrink-0">
                        <IndianRupee size={14} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5 font-normal">Total Earned</p>
                        <p className="font-semibold text-gray-900">₹{booking.totalPrice?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="ml-auto flex items-center">
                      <button
                        onClick={() => setConfirmDelete({ isOpen: true, bookingId: booking._id })}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, bookingId: "" })}
        onConfirm={() => handleDeleteBooking(confirmDelete.bookingId)}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? This action cannot be undone."
      />
    </div>
  );
};

export default ListingOwnerBooking;
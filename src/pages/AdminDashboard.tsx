import { useState, useEffect } from "react";
import apiRequest from "../utils/apiRequest";
import {
  Users,
  Home,
  MessageSquare,
  Menu,
  X,
  Trash2,
  Ticket,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalReviews: 0,
    totalBookings: 0,
  });
  const [listings, setListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiRequest.get("/user/admin");
        setStats(data);
        setListings(data.listings);
        setReviews(data.reviews);
        setUsers(data.users);
        setBookings(data.bookings);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Listings",
      value: stats.totalListings,
      icon: Home,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      gradient: "from-emerald-400 to-emerald-500",
    },
    {
      label: "Total Reviews",
      value: stats.totalReviews,
      icon: MessageSquare,
      color: "text-purple-600",
      bg: "bg-purple-100",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: Ticket,
      color: "text-orange-600",
      bg: "bg-orange-100",
      gradient: "from-orange-400 to-orange-500",
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "listing", label: "Listings", icon: Home },
    { id: "review", label: "Reviews", icon: MessageSquare },
    { id: "user", label: "Users", icon: Users },
    { id: "bookings", label: "Bookings", icon: Ticket },
  ];

  const handleDeleteListing = (listingId: string) => {
    setConfirmAction({
      title: "Delete Listing",
      message: "Are you sure you want to delete this listing? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await apiRequest.delete(`/listing/${listingId}`);
          setListings(listings.filter((l: any) => l._id !== listingId));
          setStats((prev) => ({ ...prev, totalListings: prev.totalListings - 1 }));
        } catch (error) {
          console.error("Error deleting listing:", error);
          alert("Failed to delete listing");
        }
        setShowConfirm(false);
      },
    });
    setShowConfirm(true);
  };

  const handleDeleteReview = (reviewId: string, listingId: string) => {
    setConfirmAction({
      title: "Delete Review",
      message: "Are you sure you want to delete this review? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await apiRequest.delete(`/review/delete/${listingId}`, {
            data: { reviewId },
          });
          setReviews(reviews.filter((r: any) => r._id !== reviewId));
          setStats((prev) => ({ ...prev, totalReviews: prev.totalReviews - 1 }));
        } catch (error) {
          console.error("Error deleting review:", error);
          alert("Failed to delete review");
        }
        setShowConfirm(false);
      },
    });
    setShowConfirm(true);
  };

  const handleDeleteBooking = (bookingId: string) => {
    setConfirmAction({
      title: "Delete Booking",
      message: "Are you sure you want to delete this booking? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await apiRequest.delete(`/booking/delete`, {
            data: { bookingId },
          });
          setBookings(bookings.filter((b) => b._id !== bookingId));
          setStats((prev) => ({ ...prev, totalBookings: prev.totalBookings - 1 }));
        } catch (error) {
          console.error("Error deleting booking:", error);
          alert("Failed to delete booking");
        }
        setShowConfirm(false);
      },
    });
    setShowConfirm(true);
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl h-36 border border-slate-100"
          />
        ))}
      </div>
      <div className="bg-white h-96 rounded-2xl border border-slate-100" />
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-slate-50 overflow-hidden font-sans">
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmAction?.onConfirm || (() => {})}
        title={confirmAction?.title || ""}
        message={confirmAction?.message || ""}
      />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col pt-20 lg:pt-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-20 px-6 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Admin Panel
            </h1>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-slate-600 transition"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 py-6 overflow-y-auto custom-scrollbar">
          <div className="px-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Dashboard Menu
          </div>
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-primary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`}
                    />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3 border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm">
              AD
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Admin User</p>
              <p className="text-xs text-slate-500">System Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 lg:hidden flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-slate-800 capitalize tracking-tight">
            {activeTab === "user"
              ? "Users"
              : activeTab === "listing"
                ? "Listings"
                : activeTab === "review"
                  ? "Reviews"
                  : activeTab}
          </h2>
          <div className="w-10" /> 
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 lg:p-10 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="hidden lg:flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 capitalize tracking-tight">
                  {activeTab === "user"
                    ? "Manage Users"
                    : activeTab === "listing"
                      ? "Manage Listings"
                      : activeTab === "review"
                        ? "Manage Reviews"
                        : activeTab}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {activeTab === "overview"
                    ? "Here's a quick look at your platform's performance."
                    : `View and manage all ${activeTab} on your platform.`}
                </p>
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                          <div
                            className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-linear-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity blur-2xl`}
                          />

                          <div className="flex items-center justify-between z-10">
                            <div
                              className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center shadow-sm`}
                            >
                              <Icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                          </div>
                          <div className="mt-6 z-10">
                            <h3 className="text-slate-500 text-sm font-medium mb-1">
                              {stat.label}
                            </h3>
                            <p className="text-3xl font-bold text-slate-900 tracking-tight">
                              {stat.value.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab !== "overview" && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/80 backdrop-blur-sm">
                          <tr>
                            {activeTab === "listing" && (
                              <>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Property Details
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Price / Night
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Location
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Type
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Owner
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Actions
                                </th>
                              </>
                            )}
                            {activeTab === "review" && (
                              <>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Reviewer
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Feedback
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Rating
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Actions
                                </th>
                              </>
                            )}
                            {activeTab === "user" && (
                              <>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  User Details
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Contact
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Role
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Joined Date
                                </th>
                              </>
                            )}
                            {activeTab === "bookings" && (
                              <>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Guest
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Property
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Stay Dates
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Guests
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Total Amount
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Status
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                  Actions
                                </th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {activeTab === "bookings" &&
                            bookings.map((booking: any) => (
                              <tr
                                key={booking._id}
                                className="hover:bg-slate-50/80 transition-colors group"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                      {booking.customer?.username
                                        ?.charAt(0)
                                        .toUpperCase() || "U"}
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-semibold text-slate-900">
                                        {booking.customer?.username ||
                                          "Unknown"}
                                      </div>
                                      <div className="text-xs text-slate-500 mt-0.5">
                                        ID:{" "}
                                        {booking.customer?._id?.substring(0, 8)}
                                        ...
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-semibold text-slate-900 truncate max-w-50">
                                    {booking.listing?.title ||
                                      "Listing Unavailable"}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                    <Home className="w-3 h-3" />
                                    {booking.listing?.location ||
                                      "Unknown location"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-slate-900 font-medium">
                                    {new Date(
                                      booking.checkIn,
                                    ).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-0.5">
                                    to{" "}
                                    {new Date(
                                      booking.checkOut,
                                    ).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                                  <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full w-fit">
                                    <Users className="w-3.5 h-3.5 text-slate-500" />
                                    {booking.guests}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-bold text-slate-900 bg-emerald-50 px-3 py-1 rounded-lg w-fit border border-emerald-100">
                                    ₹
                                    {booking.totalPrice?.toLocaleString() ||
                                      "0"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                      booking.status === "pending"
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : booking.status === "confirmed"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-rose-50 text-rose-700 border-rose-200"
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                        booking.status === "pending"
                                          ? "bg-amber-500"
                                          : booking.status === "confirmed"
                                            ? "bg-emerald-500"
                                            : "bg-rose-500"
                                      }`}
                                    ></span>
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() =>
                                      handleDeleteBooking(booking._id)
                                    }
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Cancel Booking"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}

                          {activeTab === "listing" &&
                            listings.map((listing: any) => (
                              <tr
                                key={listing._id}
                                className="hover:bg-slate-50/80 transition-colors group"
                              >
                                <td className="px-6 py-4">
                                  <div className="text-sm font-semibold text-slate-900 line-clamp-2 max-w-62.5">
                                    {listing.title}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    ID: {listing._id.substring(0, 8)}...
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-bold text-slate-900">
                                    ₹{listing.price?.toLocaleString()}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-slate-700 font-medium">
                                    {listing.location}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                                    {listing.category || "Property"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                      {listing.owner?.username
                                        ?.charAt(0)
                                        .toUpperCase() || "O"}
                                    </div>
                                    {listing.owner?.username || "Unknown"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() =>
                                      handleDeleteListing(listing._id)
                                    }
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Delete Listing"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}

                          {activeTab === "review" &&
                            reviews.map((review: any) => (
                              <tr
                                key={review._id}
                                className="hover:bg-slate-50/80 transition-colors group"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
                                      {review?.owner?.username
                                        ?.charAt(0)
                                        .toUpperCase() || "U"}
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-semibold text-slate-900">
                                        {review.owner?.username || "Unknown"}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-slate-600 line-clamp-2 max-w-md italic">
                                    "{review.comment}"
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full w-fit border border-primary/20 text-primary font-bold text-sm">
                                    <span>★</span>
                                    <span>{review.rating}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                  <button
                                    onClick={() =>
                                      handleDeleteReview(
                                        review._id,
                                        review.listing,
                                      )
                                    }
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Delete Review"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}

                          {activeTab === "user" &&
                            users.map((user: any) => (
                              <tr
                                key={user._id}
                                className="hover:bg-slate-50/80 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold shadow-sm">
                                      {user?.username
                                        ?.charAt(0)
                                        .toUpperCase() || "U"}
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-bold text-slate-900">
                                        {user.username}
                                      </div>
                                      <div className="text-xs text-slate-500 mt-0.5">
                                        ID: {user._id.substring(0, 8)}...
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-slate-600 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                    {user.email}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                                      user.admin
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "bg-slate-100 text-slate-700 border border-slate-200"
                                    }`}
                                  >
                                    {user.admin ? "Admin" : "User"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                  {new Date(user.createdAt).toLocaleDateString(
                                    undefined,
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    },
                                  )}
                                </td>
                              </tr>
                            ))}

                          {activeTab === "bookings" &&
                            bookings.length === 0 && (
                              <tr>
                                <td
                                  colSpan={7}
                                  className="px-6 py-12 text-center text-slate-500 font-medium text-sm"
                                >
                                  No bookings found
                                </td>
                              </tr>
                            )}
                          {activeTab === "listing" && listings.length === 0 && (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-6 py-12 text-center text-slate-500 font-medium text-sm"
                              >
                                No listings available
                              </td>
                            </tr>
                          )}
                          {activeTab === "review" && reviews.length === 0 && (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-6 py-12 text-center text-slate-500 font-medium text-sm"
                              >
                                No reviews submitted yet
                              </td>
                            </tr>
                          )}
                          {activeTab === "user" && users.length === 0 && (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-6 py-12 text-center text-slate-500 font-medium text-sm"
                              >
                                No users registered yet
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
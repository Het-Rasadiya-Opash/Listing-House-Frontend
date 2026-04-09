import { Download, Package } from "lucide-react";
import { useEffect, useState } from "react";
import apiRequest from "../utils/apiRequest";
import Listing from "./Listing";
import ConfirmModal from "./ConfirmModal";

const YourListing = () => {
  const [listings, setListings] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    listingId: string;
  }>({ isOpen: false, listingId: "" });

  useEffect(() => {
    const fetchUserListing = async () => {
      try {
        const res = await apiRequest.get(`/listing/user-listing`);
        setListings(res.data.data);
      } catch (error) {
        console.error("Failed to fetch listing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserListing();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await apiRequest.get(`/listing/csv-data`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the CSV file:", error);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      await apiRequest.delete(`/listing/${listingId}`);
      setListings(listings.filter((l: any) => l._id !== listingId));
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
    setConfirmDelete({ isOpen: false, listingId: "" });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-red-50 p-2 sm:p-2.5 rounded-xl shadow-sm border border-red-100 shrink-0">
            <Package size={20} className="text-primary sm:w-5.5 sm:h-5.5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
              Your Listings
            </h2>
            {!loading && (
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Total: {listings.length}{" "}
                {listings.length === 1 ? "Listing" : "Listings"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="group flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:text-primary transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-100"
          >
            <Download
              size={18}
              className="text-gray-400 group-hover:text-primary transition-colors"
            />
            <span className="transition-colors">Export CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
          <Package size={48} className="mx-auto text-gray-300 mb-3" />
          <h2 className="text-[18px] font-semibold text-gray-900 mb-1">
            No listings yet
          </h2>
          <p className="text-gray-500 text-[14px]">
            Start creating your first listing!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing: any) => (
            <Listing
              key={listing._id}
              listing={listing}
              onDelete={(id) =>
                setConfirmDelete({ isOpen: true, listingId: id })
              }
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, listingId: "" })}
        onConfirm={() => handleDeleteListing(confirmDelete.listingId)}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
      />
    </div>
  );
};

export default YourListing;
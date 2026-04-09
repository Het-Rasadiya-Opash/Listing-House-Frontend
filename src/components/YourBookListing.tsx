import { useEffect, useState } from "react";
import apiRequest from "../utils/apiRequest";
import { Calendar, Users, Download } from "lucide-react";
import jsPDF from "jspdf";
import ConfirmModal from "./ConfirmModal";

const YourBookListing = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any>([]);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    bookingId: string;
  }>({ isOpen: false, bookingId: "" });

  useEffect(() => {
    const fetchUserBooking = async () => {
      try {
        const res = await apiRequest.get(`/booking/user`);
        setBookings(res.data);
      } catch (error) {
        console.log("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserBooking();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const bookingId = params.get("bookingId");

    if (success === "true" && bookingId) {
      apiRequest
        .put("/booking/payment", { bookingId })
        .then(() => {
          window.history.replaceState({}, "", "/profile");
          window.location.reload();
        })
        .catch((err) => console.error("Payment update failed:", err));
    }
  }, []);

  const handleCheckout = async (booking: any) => {
    try {
      const response = await apiRequest.post(
        `/payment/create-checkout-session`,
        {
          listing: booking.listing,
          bookingId: booking._id,
          stayDay: booking.stayDay,
        },
      );
      window.location.href = response.data.url;
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownloadInvoice = async (booking: any) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210;
    const PX = 16; // horizontal padding
    const primary: [number, number, number] = [255, 56, 92];
    const primaryDark: [number, number, number] = [215, 4, 102];
    const dark: [number, number, number] = [17, 24, 39];
    const gray: [number, number, number] = [100, 110, 125];
    const lightBg: [number, number, number] = [252, 252, 253];
    const white: [number, number, number] = [255, 255, 255];
    const borderColor: [number, number, number] = [230, 232, 236];

    // ── HEADER ────────────────────────────────────────────────────────
    doc.setFillColor(...primary);
    doc.rect(0, 0, W, 42, "F");
    doc.setFillColor(...primaryDark);
    doc.rect(0, 38, W, 4, "F");

    doc.setTextColor(...white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ListingHouse", PX, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Property Rental Platform", PX, 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("INVOICE", W - PX, 18, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`No. ${booking._id?.slice(-10).toUpperCase()}`, W - PX, 25, { align: "right" });

    // ── META ROW ──────────────────────────────────────────────────────
    const issueDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
    doc.setTextColor(...gray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Issue Date: ${issueDate}`, PX, 52);

    // PAID pill
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(W - PX - 28, 46, 28, 9, 2, 2, "F");
    doc.setDrawColor(134, 239, 172);
    doc.setLineWidth(0.3);
    doc.roundedRect(W - PX - 28, 46, 28, 9, 2, 2, "S");
    doc.setTextColor(21, 128, 61);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("PAID", W - PX - 14, 51.8, { align: "center" });

    // ── PROPERTY IMAGE ────────────────────────────────────────────────
    const imageUrl = booking.listing?.images?.[0];
    const imgX = PX;
    const imgW = W - PX * 2;
    const imgH = 50;
    const imgY = 58;

    if (imageUrl) {
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const mimeMatch = base64.match(/^data:image\/([a-zA-Z]+);/);
        const ext = mimeMatch ? mimeMatch[1].toUpperCase() : "JPEG";
        const safeExt = ["JPEG", "JPG", "PNG", "WEBP"].includes(ext) ? ext : "JPEG";
        doc.addImage(base64, safeExt, imgX, imgY, imgW, imgH, undefined, "FAST");

        // dark overlay bar at bottom of image for title text
        doc.setFillColor(0, 0, 0);
        doc.rect(imgX, imgY + imgH - 16, imgW, 16, "F");

        doc.setTextColor(...white);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const title = booking.listing?.title || "Property";
        doc.text(
          title.length > 50 ? title.slice(0, 47) + "..." : title,
          imgX + 4,
          imgY + imgH - 5,
        );
      } catch {
        // image failed — skip silently
      }
    }

    // ── PROPERTY DETAILS SECTION ──────────────────────────────────────
    let y = imgY + imgH + 10;

    const drawSectionHeader = (label: string, yPos: number) => {
      doc.setFillColor(255, 245, 247);
      doc.rect(PX, yPos, W - PX * 2, 8, "F");
      doc.setFillColor(...primary);
      doc.rect(PX, yPos, 3, 8, "F");
      doc.setTextColor(...primary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(label, PX + 6, yPos + 5.5);
    };

    drawSectionHeader("PROPERTY DETAILS", y);
    y += 12;

    if (!imageUrl) {
      doc.setTextColor(...dark);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const title = booking.listing?.title || "Property";
      doc.text(
        title.length > 55 ? title.slice(0, 52) + "..." : title,
        PX, y,
      );
      y += 7;
    }

    doc.setTextColor(...gray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Location: ${booking.listing?.location || "-"}`, PX, y);
    y += 14;

    // ── BOOKING DETAILS TABLE ─────────────────────────────────────────
    drawSectionHeader("BOOKING DETAILS", y);
    y += 12;

    const rows: [string, string][] = [
      ["Check-in",      new Date(booking.checkIn).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })],
      ["Check-out",     new Date(booking.checkOut).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })],
      ["Duration",      `${booking.stayDay} ${booking.stayDay === 1 ? "night" : "nights"}`],
      ["Guests",        `${booking.guests} ${booking.guests === 1 ? "guest" : "guests"}`],
      ["Price / night", `Rs. ${booking.listing?.price?.toLocaleString("en-IN") ?? "-"}`],
    ];

    const rowH = 10;
    rows.forEach(([label, value], i) => {
      const rowY = y + i * rowH;
      doc.setFillColor(i % 2 === 0 ? 255 : 249, i % 2 === 0 ? 255 : 249, i % 2 === 0 ? 255 : 251);
      doc.rect(PX, rowY, W - PX * 2, rowH, "F");
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.25);
      doc.line(PX, rowY + rowH, W - PX, rowY + rowH);

      doc.setTextColor(...gray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(label, PX + 4, rowY + 6.5);

      doc.setTextColor(...dark);
      doc.setFont("helvetica", "bold");
      doc.text(value, W - PX - 4, rowY + 6.5, { align: "right" });
    });

    y += rows.length * rowH + 8;

    // ── TOTAL BOX ─────────────────────────────────────────────────────
    doc.setFillColor(...primary);
    doc.roundedRect(PX, y, W - PX * 2, 16, 2, 2, "F");

    doc.setTextColor(...white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("Total Amount Paid", PX + 5, y + 10);
    doc.setFontSize(12);
    doc.text(`Rs. ${booking.totalPrice?.toLocaleString("en-IN")}`, W - PX - 5, y + 10, { align: "right" });

    // ── FOOTER ────────────────────────────────────────────────────────
    const footerY = 274;
    doc.setFillColor(...lightBg);
    doc.rect(0, footerY, W, 23, "F");
    doc.setDrawColor(...primary);
    doc.setLineWidth(0.5);
    doc.line(0, footerY, W, footerY);

    doc.setTextColor(...primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("ListingHouse", PX, footerY + 8);

    doc.setTextColor(...gray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Thank you for choosing ListingHouse!", PX, footerY + 14);
    doc.text("support@listinghouse.com", W - PX, footerY + 8, { align: "right" });
    doc.text("www.listinghouse.com", W - PX, footerY + 14, { align: "right" });

    doc.save(`invoice-${booking._id?.slice(-8)}.pdf`);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await apiRequest.delete(`/booking/delete`, {
        data: { bookingId },
      });
      setBookings(bookings.filter((b: any) => b._id !== bookingId));
    } catch (error) {
      console.error("Error deleting booking:", error);
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
              Your Bookings
            </h2>
            {!loading && (
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Total: {bookings.length}{" "}
                {bookings.length === 1 ? "Booking" : "Bookings"}
              </p>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
          <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
          <h2 className="text-[18px] font-semibold text-gray-900 mb-1">
            No bookings yet
          </h2>
          <p className="text-gray-500 text-[14px]">
            Start exploring and book your first stay!
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking: any) => (
            <div
              key={booking._id}
              className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-40 h-28 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={booking.listing?.images?.[0] || "/placeholder.jpg"}
                    alt={booking.listing?.title || "Listing"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.listing?.title || "Listing"}
                      </h3>
                    </div>
                    <p className="text-[15px] text-gray-500 mb-3">
                      {booking.listing?.location}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700 font-normal">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400 shrink-0" />
                        {new Date(booking.checkIn).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        –{" "}
                        {new Date(booking.checkOut).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-gray-400 shrink-0" />
                        {booking.guests}{" "}
                        {booking.guests === 1 ? "guest" : "guests"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between mt-4 md:mt-0 gap-3">
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-semibold text-gray-900">
                        ₹{booking.totalPrice?.toLocaleString()}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          booking.isPaid
                            ? "bg-green-50 text-green-700 border-green-200"
                            : booking.status === "confirmed"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : booking.status === "pending"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          booking.isPaid
                            ? "bg-green-500"
                            : booking.status === "confirmed"
                              ? "bg-blue-500"
                              : booking.status === "pending"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        }`} />
                        {booking.isPaid ? "Paid" : booking.status || "Pending"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {booking.status === "pending" && (
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              isOpen: true,
                              bookingId: booking._id,
                            })
                          }
                          className="text-sm font-medium text-gray-700 underline hover:text-red-600 transition"
                        >
                          Cancel
                        </button>
                      )}

                      {booking.status === "confirmed" && !booking.isPaid && (
                        <button
                          onClick={() => handleCheckout(booking)}
                          className="bg-gray-900 hover:bg-black text-white font-semibold py-2.5 px-6 rounded-lg transition active:scale-95 text-[15px]"
                        >
                          Pay Now
                        </button>
                      )}

                      {booking.isPaid && (
                        <button
                          onClick={() => handleDownloadInvoice(booking)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg transition active:scale-95 text-[14px]"
                        >
                          <Download size={15} />
                          Invoice
                        </button>
                      )}
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

export default YourBookListing;
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import { X } from "lucide-react";

const categories = [
  "rooms",
  "beachfront",
  "cabins",
  "trending",
  "city",
  "countryside",
];

const EditListing = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "rooms",
    location: "",
    coordinates: [0, 0] as [number, number],
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await apiRequest.get(`/listing/${listingId}`);
        const listing = response.data.data;
        setFormData({
          title: listing.title,
          description: listing.description || "",
          price: listing.price,
          category: listing.category,
          location: listing.location,
          coordinates: listing.geometry?.coordinates && Array.isArray(listing.geometry.coordinates) && listing.geometry.coordinates.length === 2 
            ? [Number(listing.geometry.coordinates[0]) || 0, Number(listing.geometry.coordinates[1]) || 0]
            : [0, 0],
        });
        setExistingImages(listing.images || []);
      } catch (err) {
        setError("Failed to load listing");
      }
    };
    fetchListing();
  }, [listingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("location", formData.location);
    data.append("coordinates", JSON.stringify(formData.coordinates));
    images.forEach((image) => data.append("images", image));

    try {
      await apiRequest.put(`/listing/${listingId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/listing/${listingId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update listing");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);

    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(filePreviews);
  };

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      await apiRequest.delete(`/listing/${listingId}/image`, {
        data: { imageUrl },
      });

      setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    } catch (err:any) {
      setError(err.response?.data?.message);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const inputStyles = "w-full px-4 py-3.5 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition duration-200 text-gray-900";
  const labelStyles = "block text-sm font-semibold text-gray-900 mb-2";

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Edit your listing
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="border border-gray-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>

            {(existingImages.length > 0 || imagePreviews.length > 0) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-4">
                  {existingImages.map((img, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <img
                        src={img}
                        alt="preview"
                        className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img)}
                        className="absolute -top-3 -right-3 bg-white border border-gray-300 text-gray-900 hover:text-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={preview}
                        alt="new-preview"
                        className="w-32 h-32 object-cover rounded-xl border-2 border-primary shadow-sm"
                      />
                      <span className="absolute top-2 left-2 bg-primary text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-md">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute -top-3 -right-3 bg-white border border-gray-300 text-gray-900 hover:text-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition"
                      >
                        <X size={16}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className={labelStyles}>Add More Photos</label>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-full text-sm border border-gray-400 rounded-xl px-4 py-3 flex items-center gap-3 pointer-events-none">
                  <span className="py-2 px-4 rounded-full bg-gray-100 text-gray-900 text-sm font-medium">Choose Files</span>
                  <span className="text-gray-500">
                    {images.length === 0 ? "No file chosen" : `${images.length} file${images.length > 1 ? "s" : ""}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
             <h2 className="text-xl font-semibold text-gray-900">Listing basics</h2>

            <div>
              <label className={labelStyles}>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputStyles}
                required
              />
            </div>

            <div>
              <label className={labelStyles}>Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`${inputStyles} resize-none`}
              />
            </div>

            <div>
              <label className={labelStyles}>Price per Night (₹) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={inputStyles}
                required
              />
            </div>

            <div>
              <label className={labelStyles}>General Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={inputStyles}
                required
              />
            </div>

            <div>
              <label className={labelStyles}>Property Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`${inputStyles} bg-white`}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Map location</h2>
            <p className="text-sm text-gray-600 font-medium mb-4">Ensure your property's pin coordinates are correct.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Longitude (x) *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.coordinates[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        coordinates: [Number(e.target.value), formData.coordinates[1]],
                      })
                    }
                    className={inputStyles}
                    required
                  />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Latitude (y) *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.coordinates[1]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        coordinates: [formData.coordinates[0], Number(e.target.value)],
                      })
                    }
                    className={inputStyles}
                    required
                  />
               </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-white px-10 py-3.5 rounded-xl font-semibold transition duration-200 text-lg shadow-sm"
            >
              {loading ? "Updating..." : "Update listing"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditListing;
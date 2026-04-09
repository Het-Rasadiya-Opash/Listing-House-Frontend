import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import { Loader2, MapPin, X } from "lucide-react";

const categories = [
  "rooms",
  "beachfront",
  "cabins",
  "trending",
  "city",
  "countryside",
];

const CreateListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "rooms",
    longitude: "",
    latitude: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [gettingLocation, setGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("location", formData.location);
    data.append("category", formData.category);
    data.append("coordinates", JSON.stringify([Number(formData.longitude), Number(formData.latitude)]));
    images.forEach((image) => data.append("images", image));

    try {
      await apiRequest.post("/listing", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create listing");
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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          longitude: position.coords.longitude.toString(),
          latitude: position.coords.latitude.toString(),
        });
        setGettingLocation(false);
      },
      () => {
        setError("Unable to retrieve your location");
        setGettingLocation(false);
      }
    );
  };

  const inputStyles = "w-full px-4 py-3.5 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition duration-200 text-gray-900";
  const labelStyles = "block text-sm font-semibold text-gray-900 mb-2";

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Tell us about your place
        </h1>

        {error && (
          <div className="mb-6 p-4 text-sm bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="border border-gray-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                accept="image/*"
                ref={fileInputRef}
                className="w-full text-sm border border-gray-400 rounded-xl px-4 py-3 
                file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                file:text-sm file:font-medium file:bg-gray-100 file:text-gray-900 
                hover:file:bg-gray-200 transition cursor-pointer opacity-0 absolute inset-0 h-full"
                required={images.length === 0}
              />
              <div className="w-full text-sm border border-gray-400 rounded-xl px-4 py-3 flex items-center gap-3 pointer-events-none">
                <span className="py-2 px-4 rounded-full bg-gray-100 text-gray-900 text-sm font-medium">Choose Files</span>
                <span className="text-gray-500">
                  {images.length === 0 ? "No file chosen" : `${images.length} file${images.length > 1 ? "s" : ""}`}
                </span>
              </div>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-wrap gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt="preview"
                        className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute -top-3 -right-3 bg-white border border-gray-300 text-gray-900 hover:text-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  placeholder="E.g. Cozy cabin with a view"
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
                  placeholder="Describe what makes your place special..."
                />
             </div>

             <div>
                <label className={labelStyles}>Price per Night (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={inputStyles}
                  placeholder="0"
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
                  placeholder="City, Region, or Neighborhood"
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
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Map location</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
               <p className="text-sm text-gray-600 font-medium">Pinpoint exactly where your property is located.</p>
               <button
                 type="button"
                 onClick={getCurrentLocation}
                 disabled={gettingLocation}
                 className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold 
                 bg-white text-gray-900 border border-gray-900 rounded-xl 
                 hover:bg-gray-100 disabled:opacity-50 transition duration-200 whitespace-nowrap"
               >
                 {gettingLocation ? (
                   <><Loader2 className="w-4 h-4 animate-spin" /> Locating...</>
                 ) : (
                   <><MapPin className="w-4 h-4" /> Use Current Location</>
                 )}
               </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className={inputStyles}
                    required
                  />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
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
               {loading ? "Saving..." : "Create your listing"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
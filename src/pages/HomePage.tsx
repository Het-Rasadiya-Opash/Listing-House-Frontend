/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import Listing from "../components/Listing";
import {
  Bed,
  Palmtree,
  Warehouse,
  Flame,
  Building2,
  Tractor,
  LayoutGrid,
  Search
} from "lucide-react";

const categories = [
  { name: "rooms", icon: Bed, label: "Rooms" },
  { name: "beachfront", icon: Palmtree, label: "Beachfront" },
  { name: "cabins", icon: Warehouse, label: "Cabins" },
  { name: "trending", icon: Flame, label: "Trending" },
  { name: "city", icon: Building2, label: "Top cities" },
  { name: "countryside", icon: Tractor, label: "Countryside" },
];

const HomePage = () => {
  const [listings, setListings] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get("search") || "";
  const [search, setSearch] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchListings = async (category = "", searchQuery = "") => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (category) queryParams.append("category", category);
      if (searchQuery) queryParams.append("search", searchQuery);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const res = await apiRequest.get(`/listing${query}`);
      setListings(res.data.data);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings(selectedCategory, searchParam);
  }, [selectedCategory, searchParam]);

  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setSearchParams({ search: search.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-20 z-40 bg-white border-b border-gray-100 shadow-sm mt-4">
        <div className="max-w-7xl mx-auto xl:px-20 md:px-10 sm:px-2 px-4 py-4">
          
          <form onSubmit={handleSearch} className="md:hidden flex justify-center mb-6 w-full">
            <div className="flex items-center w-full max-w-full border border-gray-300 rounded-full py-2 px-4 shadow-md bg-white">
              <Search className="text-gray-500 mr-2" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Where to?"
                className="grow text-md font-medium text-gray-800 bg-transparent focus:outline-none placeholder-gray-500"
              />
            </div>
          </form>

          <div className="flex flex-row items-center justify-between lg:justify-start overflow-x-auto gap-10 scrollbar-hide px-2">
            <button
              onClick={() => handleCategoryClick("")}
              className={`flex flex-col items-center justify-center gap-2 pb-3 border-b-2 hover:text-black transition cursor-pointer min-w-max ${
                selectedCategory === "" ? "border-black text-black" : "border-transparent text-gray-500"
              }`}
            >
              <LayoutGrid size={24} />
              <span className="text-sm font-medium">All Homes</span>
            </button>

            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => handleCategoryClick(item.name)}
                  className={`flex flex-col items-center justify-center gap-2 pb-3 border-b-2 hover:text-black transition cursor-pointer min-w-max ${
                    selectedCategory === item.name ? "border-black text-black" : "border-transparent text-gray-500"
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-8 pb-20">
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {listings.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                <p className="text-2xl font-semibold text-gray-800 mb-2">No exact matches</p>
                <p className="font-light text-gray-600">Try changing or removing some of your filters.</p>
              </div>
            ) : (
              listings.map((listing: any) => <Listing key={listing._id} listing={listing} />)
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
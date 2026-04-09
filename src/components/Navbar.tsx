import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../utils/authStore";
import { useState, useEffect, useRef } from "react";
import apiRequest from "../utils/apiRequest";
import { Menu, User, Search } from "lucide-react";

const Navbar = () => {
  const { currentUser, removeCurrentUser, checkTokenExpiry } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check token expiry when component mounts
    checkTokenExpiry();
  }, [checkTokenExpiry]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest.post("/user/logout", {});
      removeCurrentUser();
      setShowDropdown(false);
      navigate("/");
    } catch (err) { }
  };

  return (
    <nav className="fixed w-full bg-white z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
        <div className="flex flex-row items-center justify-between gap-3 md:gap-0 h-20">

          <Link to="/" className="flex items-center gap-2 text-primary">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '32px', width: '32px', fill: 'currentColor' }}><path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.644-.672-.624-.652-.619-.643-.243-.255c-2.152 2.128-4.485 3.386-6.709 3.386-3.48 0-6.357-2.416-6.357-6.478 0-.853.146-1.787.525-2.852l.145-.353c.986-2.295 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.21l-.523 1.003c-1.926 3.773-6.06 12.43-7.031 14.692l-.345.836c-.327 1.006-.479 1.838-.479 2.437 0 2.945 1.956 4.478 4.357 4.478 1.785 0 3.868-1.055 5.829-2.887l.2-.191.688-.673.659-.646L16 23.316l.633.62.659.646.688.673.2.191c1.961 1.832 4.044 2.887 5.829 2.887 2.401 0 4.357-1.533 4.357-4.478 0-.6-.152-1.431-.479-2.437l-.345-.836c-.971-2.262-5.105-10.919-7.031-14.692l-.523-1.003C18.053 3.539 17.239 3 16 3z"></path></svg>
            <div className="font-bold text-xl md:text-2xl tracking-tight hidden lg:block text-primary">
              listinghouse
            </div>
          </Link>

          <div className="hidden md:block flex-1 max-w-md mx-6">
            <form 
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem('search') as HTMLInputElement;
                if (input.value.trim()) {
                  navigate(`/?search=${encodeURIComponent(input.value.trim())}`);
                } else {
                  navigate(`/`);
                }
              }} 
              className="flex flex-row items-center justify-between border border-gray-300 rounded-full py-1.5 px-3 shadow-sm hover:shadow-md transition bg-white"
            >
              <input 
                type="text"
                name="search"
                placeholder="Search destinations..." 
                className="text-sm font-semibold px-3 outline-none w-full bg-transparent text-gray-800 placeholder-gray-500"
              />
              <button type="submit" className="bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-dark transition shrink-0">
                <Search size={16} strokeWidth={3} />
              </button>
            </form>
          </div>


          <div className="relative" ref={dropdownRef}>
            <div className="flex flex-row items-center gap-1">
              <Link to="/create-listing">
                <div className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer">
                  Listing House your home
                </div>
              </Link>

              <div className="py-2 px-2 border border-neutral-300 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition"
                onClick={() => setShowDropdown(!showDropdown)}>
                <Menu size={18} className="ml-1 text-gray-700" />
                <div>
                  {currentUser ? (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <User size={30} className="text-gray-500 bg-white" strokeWidth={1.5} />
                  )}
                </div>
              </div>
            </div>

            {showDropdown && (
              <div className="absolute rounded-xl shadow-lg w-[40vw] md:w-60 bg-white overflow-hidden right-0 top-14 text-sm border border-neutral-200 py-2 z-60">
                <div className="flex flex-col cursor-pointer">
                  {currentUser ? (
                    <>
                      <Link to="/profile" onClick={() => setShowDropdown(false)} className="px-4 py-3 hover:bg-neutral-100 font-semibold transition text-gray-800">Profile</Link>
                      <Link to="/create-listing" onClick={() => setShowDropdown(false)} className="px-4 py-3 hover:bg-neutral-100 transition text-gray-700">Create Listing</Link>
                      <Link to="/wishlist" onClick={() => setShowDropdown(false)} className="px-4 py-3 hover:bg-neutral-100 transition text-gray-700">Wishlist</Link>
                      {currentUser.admin && <Link to="/admin" onClick={() => setShowDropdown(false)} className="px-4 py-3 hover:bg-neutral-100 transition text-gray-700">Dashboard</Link>}
                      <hr className="my-2 border-neutral-200" />
                      <button onClick={handleLogout} className="text-left px-4 py-3 hover:bg-neutral-100 transition text-gray-700 w-full">Log out</button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth" onClick={() => setShowDropdown(false)} className="px-4 py-3 hover:bg-neutral-100 font-semibold transition text-gray-800">Sign up</Link>
                      <Link to="/auth" onClick={() => setShowDropdown(false)} className="px-4 py-3 hover:bg-neutral-100 transition text-gray-700">Log in</Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
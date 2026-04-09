import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import ListingPage from "./pages/ListingPage";
import AuthPage from "./pages/AuthPage";
import CreateListing from "./pages/CreateListing";
import Profile from "./pages/Profile";
import EditListing from "./pages/EditListing";
import ProtectedRoutes from "./components/ProtectedRoutes";
import AdminRoutes from "./components/AdminRoutes";
import AdminDashboard from "./pages/AdminDashboard";
import BookingForm from "./pages/BookingForm";
import Wishlist from "./pages/Wishlist";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
     <Toaster position="bottom-center" reverseOrder={false} />
      <Navbar />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />


          <Route path="/listing/:id" element={<ListingPage />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/update-listing/:listingId" element={<EditListing />} />
            <Route path="/booking/:listingId" element={<BookingForm />} />
            <Route path="/wishlist" element={<Wishlist />}/>
          </Route>
          <Route element={<AdminRoutes />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </div>
    </>
  );
};

export default App;
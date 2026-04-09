import ListingOwnerBooking from "../components/ListingOwnerBooking";
import UserProfileDetail from "../components/UserProfileDetail";
import YourBookListing from "../components/YourBookListing";
import YourListing from "../components/YourListing";

const Profile = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4 xl:px-20 md:px-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        <div>
          <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight mb-8">
            Account
          </h1>
          <UserProfileDetail />
        </div>

        <div className="pt-10 border-t border-gray-200">
          <YourBookListing />
        </div>

        <div className="pt-10 border-t border-gray-200">
          <YourListing />
        </div>

        <div className="pt-10 border-t border-gray-200">
          <ListingOwnerBooking />
        </div>
      </div>
    </div>
  );
};

export default Profile;
import useAuthStore from "../utils/authStore";
import { Mail, Calendar } from "lucide-react";

const UserProfileDetail = () => {
  const { currentUser } = useAuthStore();

  if (!currentUser)
    return <div className="p-8">Please log in to view your profile.</div>;
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
      <div className="w-25 h-25 bg-gray-900 rounded-full flex items-center justify-center text-4xl text-white font-bold uppercase shadow-sm">
        {currentUser.username.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[26px] font-semibold text-gray-900 tracking-tight">
            Hi, I'm {currentUser.username}
          </span>
        </div>
        <div className="flex items-center gap-4 text-gray-600 font-normal">
          <div className="flex items-center gap-1.5">
            <Mail size={16} />
            <span className="text-[15px]">{currentUser.email}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <Calendar size={16} />
            <span className="text-[15px]">
              Joined{" "}
              {new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetail;
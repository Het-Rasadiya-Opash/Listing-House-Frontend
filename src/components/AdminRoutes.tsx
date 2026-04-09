import useAuthStore from "../utils/authStore";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoutes = () => {
  const { currentUser } = useAuthStore();
  return currentUser?.admin ? <Outlet /> : <Navigate to="/auth" />;
};

export default AdminRoutes;
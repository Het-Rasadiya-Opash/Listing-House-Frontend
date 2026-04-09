import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../utils/authStore";

const ProtectedRoutes = () => {
  const { currentUser } = useAuthStore();
  return currentUser ? <Outlet /> : <Navigate to="/auth" />;
};

export default ProtectedRoutes;
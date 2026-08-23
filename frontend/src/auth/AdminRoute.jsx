import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

function AdminRoute() {
  const { usuario } = useAuth();

  if (usuario?.perfil !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;

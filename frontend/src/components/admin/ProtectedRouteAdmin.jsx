// src/components/ProtectedApplicantRoute.jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function ProtectedApplicantRoute({ children }) {
  const { adminUser } = useSelector(state => state.authAdmin);
  const navigate = useNavigate();

  useEffect(() => {
    // if not logged in, or not an admin, kick them home
    if (!adminUser || adminUser.role !== "admin") {
      navigate("/admin/login");
    }
  }, [adminUser, navigate]);

  return <>{children}</>;
}

// src/components/ProtectedApplicantRoute.jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function ProtectedApplicantRoute({ children }) {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // if not logged in, or not an applicant, kick them home
    if (!user || user.role !== "applicant") {
      navigate("/");
    }
  }, [user, navigate]);

  return <>{children}</>;
}

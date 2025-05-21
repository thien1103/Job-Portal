import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user !== undefined && user !== null && user.role !== 'recruiter') {
      navigate("/");
    }
  }, [user, navigate]); // ✅ Add user to dependency array

  // Optional: You can add a loading screen while user is being determined
  if (!user) return null;

  return <>{children}</>;
};

export default ProtectedRoute;

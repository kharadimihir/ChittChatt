import { Navigate } from "react-router-dom";

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // 🔁 Already logged in → go home
  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthRoute;

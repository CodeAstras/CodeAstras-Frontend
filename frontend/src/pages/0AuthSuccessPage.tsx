import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OAuthSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("access");

    console.log("OAuth access token from backend:", accessToken);

    if (accessToken) {
      // SAME KEY as in Login.tsx
      localStorage.setItem("access_token", accessToken);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  return <p style={{ color: "white" }}>Finishing sign-in with Google…</p>;
};

export default OAuthSuccessPage;

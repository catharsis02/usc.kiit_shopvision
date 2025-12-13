import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect directly to franchise dashboard
    navigate("/franchise", { replace: true });
  }, [navigate]);

  return null;
};

export default Index;

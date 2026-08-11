import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const [isClient, setIsClient] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [location, isClient]);

  return null;
}

import { updateUserLocation } from "@/services/axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const useLocation = () => {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem("location");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
     async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (
          location &&
          location.lat === coords.lat &&
          location.lng === coords.lng
        ) {
          setLoading(false);
          return;
        }

        setLocation(coords);
        localStorage.setItem("location", JSON.stringify(coords));

        try {
          await updateUserLocation(coords);
        } catch {
          console.warn("Location DB update failed");
        }
        setLoading(false);
      },
      () => {
        toast.error("Location permission denied");
        setLoading(false);
      },
      {
        enableHighAccuracy: false, // privacy-friendly
      }
    );
  };

  // AUTO-FETCH if permission already granted
  useEffect(() => {
    if (location) return;

    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          getLocation();
        }
      });
    }
  }, []);

  // Auto-update location every 30 minutes
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      getLocation();
    }, 30 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return { location, loading, getLocation };
};

"use client";
import { useEffect, useState } from "react";
import NewsList from "./NewsList";
export default function LocalNews() {
  const [location, setLocation] = useState("ng");
  useEffect(() => {
    const update = () =>
      setLocation(localStorage.getItem("news-location") || "ng");
    update();
    window.addEventListener("news-location", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("news-location", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return (
    <>
      <p>
        Stories for your selected country. Change the country in the navigation.
      </p>
      <NewsList
        title="Local News"
        query={`location=${encodeURIComponent(location)}`}
      />
    </>
  );
}

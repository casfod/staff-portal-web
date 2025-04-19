import { useState, useEffect } from "react";

const useMediaQuery = (
  query: string,
  callback?: (matches: boolean) => void
) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
      if (callback) callback(e.matches);
    };

    // Initial check
    setMatches(mediaQuery.matches);
    if (callback) callback(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query, callback]);

  return matches;
};

export default useMediaQuery;

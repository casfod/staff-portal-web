import { useState, useEffect, useRef } from 'react';

const useMediaQuery = (query: string, callback?: (matches: boolean) => void) => {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  // Keep the latest callback in a ref so the effect below doesn't need
  // `callback` in its dependency array (callers often pass a new inline
  // function on every render, which would otherwise re-run this effect
  // and re-fire the callback even though nothing actually changed).
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Initial sync only — do NOT invoke the callback here, just set state.
    // Calling the callback on mount/query-change as well as on every
    // "change" event is what caused consumers to get spuriously
    // re-triggered (e.g. closing a dropdown right after opening it).
    setMatches(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
      callbackRef.current?.(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;

import React, { createContext, useContext, useState, useEffect } from "react";

interface NavigationContextType {
  isMobileOpen: boolean;
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDesktopOpen: boolean;
  setIsDesktopOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDesktop: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true); // Default to open on desktop

  // Optionally add media query listener to auto-close mobile when desktop size
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1280px)"); // Tailwind xl breakpoint
    const handler = () => {
      if (mediaQuery.matches) {
        setIsMobileOpen(false);
      }
    };
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, []);

  const toggleDesktop = () => {
    setIsDesktopOpen((prev) => !prev);
  };

  return (
    <NavigationContext.Provider
      value={{
        isMobileOpen,
        setIsMobileOpen,
        isDesktopOpen,
        setIsDesktopOpen,
        toggleDesktop,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

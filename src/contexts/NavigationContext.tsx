import React, { createContext, useContext, useState } from "react";

// Define the shape of your context value
interface NavigationContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with an initial dummy value for type inference
const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

// Custom hook to consume the context
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

// Context provider component
export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <NavigationContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </NavigationContext.Provider>
  );
};

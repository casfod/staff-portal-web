// hooks/useNavigation.ts
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import {
  setIsDesktopOpen,
  setIsMobileOpen,
  toggleDesktop,
} from "../store/navigationSlice";

export const useNavigation = () => {
  const dispatch = useDispatch();
  const { isMobileOpen, isDesktopOpen } = useSelector(
    (state: RootState) => state.navigationSlice
  );

  return {
    isMobileOpen,
    isDesktopOpen,
    setIsMobileOpen: (value: boolean) => dispatch(setIsMobileOpen(value)),
    setIsDesktopOpen: (value: boolean) => dispatch(setIsDesktopOpen(value)),
    toggleDesktop: () => dispatch(toggleDesktop()),
  };
};

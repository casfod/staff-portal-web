import { useDispatch, useSelector } from 'react-redux';
import {
  setIsMobileOpen,
  setIsDesktopOpen,
  toggleDesktop,
  resetNavigation,
} from '../store/navigationSlice';
import { RootState } from '../store/store';

export const useNavigation = () => {
  const dispatch = useDispatch();
  const isMobileOpen = useSelector((state: RootState) => state.navigationSlice.isMobileOpen);
  const isDesktopOpen = useSelector((state: RootState) => state.navigationSlice.isDesktopOpen);

  const setMobileOpen = (isOpen: boolean) => {
    dispatch(setIsMobileOpen(isOpen));
  };

  const setDesktopOpen = (isOpen: boolean) => {
    dispatch(setIsDesktopOpen(isOpen));
  };

  const toggleDesktopNav = () => {
    dispatch(toggleDesktop());
  };

  const resetNav = () => {
    dispatch(resetNavigation());
  };

  return {
    isMobileOpen,
    isDesktopOpen,
    setMobileOpen,
    setDesktopOpen,
    toggleDesktopNav,
    resetNav,
    // Aliases for backward compatibility
    setIsMobileOpen: setMobileOpen,
    setIsDesktopOpen: setDesktopOpen,
  };
};

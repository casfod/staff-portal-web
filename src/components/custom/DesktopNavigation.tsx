import { useNavigation } from '../../hooks/useNavigation';
import Navigation from './Navigation';
import { motion } from 'framer-motion';

const EXPANDED_WIDTH = 227; // 195px content + px-3 (12px) padding both sides
const COLLAPSED_WIDTH = 72;

const DesktopNavigation = () => {
  const { isDesktopOpen } = useNavigation();

  return (
    <motion.div
      animate={{ width: isDesktopOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="hidden xl:block flex-shrink-0 border-r border-gray-100/50 overflow-visible"
    >
      <Navigation collapsed={!isDesktopOpen} />
    </motion.div>
  );
};

export default DesktopNavigation;

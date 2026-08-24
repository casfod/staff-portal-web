import { Eye, EyeOff } from 'lucide-react';

interface ShowPasswordIconProps {
  showPassword: boolean;
}

const ShowPasswordIcon: React.FC<ShowPasswordIconProps> = ({ showPassword }) => {
  return showPassword ? (
    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
  ) : (
    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
  );
};

export default ShowPasswordIcon;

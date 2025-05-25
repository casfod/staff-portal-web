import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";

interface ShowPasswordIconProps {
  showPassword: boolean;
}

const ShowPasswordIcon: React.FC<ShowPasswordIconProps> = ({
  showPassword,
}) => {
  return (
    <div className=" ">
      {!showPassword ? <HiMiniEye /> : <HiMiniEyeSlash />}
    </div>
  );
};

export default ShowPasswordIcon;

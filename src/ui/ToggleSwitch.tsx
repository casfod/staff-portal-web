// src/ui/ToggleSwitch.tsx
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void; // Changed from () => void to accept checked parameter
  disabled?: boolean;
  size?: "sm" | "md";
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = "md",
}) => {
  const sizes = {
    sm: {
      wrapper: "w-8 h-4",
      dot: "w-3 h-3",
      translate: "translate-x-4",
    },
    md: {
      wrapper: "w-11 h-6",
      dot: "w-5 h-5",
      translate: "translate-x-5",
    },
  };

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked); // Pass the new checked state
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${sizes[size].wrapper}
        flex items-center rounded-full p-1
        ${checked ? "bg-blue-600" : "bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        transition-colors duration-200 ease-in-out
      `}
    >
      <div
        className={`
          ${sizes[size].dot}
          bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out
          ${checked ? sizes[size].translate : "translate-x-0"}
        `}
      />
    </button>
  );
};

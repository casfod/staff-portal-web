import ShowPasswordIcon from "./ShowPasswordIcon";

const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  errorMessage,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  errorMessage?: string;
}) => (
  <div>
    <label htmlFor={id} className="block mb-1 font-bold text-sm text-gray-700">
      {label}
    </label>
    <div className="relative w-full">
      <input
        className="w-full h-8 md:h-10 px-4 placeholder:text-sm rounded-md border focus:border-primary focus:outline-none shadow-sm text-gray-700"
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={`Enter your ${label.toLowerCase()}`}
        value={value}
        onChange={onChange}
        required
      />
      <span
        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
        onClick={onTogglePassword}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        <ShowPasswordIcon showPassword={showPassword} />
      </span>
      {errorMessage && (
        <span className="absolute left-0 top-7 transform translate-y-1/2 cursor-pointer">
          <span className="text-red-500 text-xs font-semibold">
            {errorMessage}
          </span>
        </span>
      )}
    </div>
  </div>
);

export default PasswordInput;

import { FormEvent, useEffect, useState } from "react";
import { UserType } from "../../interfaces";
import { useAddUser } from "./Hooks/useAddUser";
import SpinnerMini from "../../ui/SpinnerMini";
import ShowPasswordIcon from "../../ui/ShowPasswordIcon";

const role = [
  { id: "ADMIN", name: "ADMIN" },
  { id: "REVIEWER", name: "REVIEWER" },
  { id: "STAFF", name: "STAFF" },
];

const AddUserForm = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isPasswordMatch, setIsPasswordMatch] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<UserType>>({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    password: "",
    passwordConfirm: "",
  });

  useEffect(() => {
    if (formData.password === formData.passwordConfirm) {
      setIsPasswordMatch(true);
    } else {
      setIsPasswordMatch(false);
    }
  }, [formData.password, formData.passwordConfirm]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const { addUser, isPending } = useAddUser();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    addUser(formData);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const ValidatePasswordLength = formData?.password?.length! < 8;

  return (
    <div className="w-[300px] md:w-[350px] flex flex-col items-center justify-center py-4 rounded-lg">
      <h2 className="text-center font-medium text-gray-700 mb-2">
        Add New User
      </h2>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center gap-3 sm:gap-7 bg-white bg-opacity-90 px-4 md:px-5 rounded-md  "
      >
        <div className="flex flex-col w-full gap-2">
          <div>
            <label
              htmlFor="first_name"
              className="block mb-0.5 font-bold text-sm text-gray-700"
            >
              First Name
            </label>
            <input
              className="w-full h-8  px-4 placeholder:text-sm rounded-md border focus:border-primary focus:outline-none shadow-sm text-gray-700"
              id="first_name"
              type="text"
              placeholder="Enter your name"
              value={formData.first_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="last_name"
              className="block mb-0.5 font-bold text-sm text-gray-700"
            >
              Last Name
            </label>
            <input
              className="w-full h-8  px-4 placeholder:text-sm rounded-md border focus:border-primary focus:outline-none shadow-sm text-gray-700"
              id="last_name"
              type="text"
              placeholder="Enter your name"
              value={formData.last_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block mb-0.5 font-bold text-sm text-gray-700"
            >
              Email
            </label>
            <input
              className="w-full h-8  px-4 placeholder:text-sm rounded-md border focus:border-primary focus:outline-none shadow-sm text-gray-700"
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block mb-0.5 font-bold text-sm text-gray-700"
            >
              Roles
            </label>
            <select
              className="w-full h-8  px-4 placeholder:text-sm rounded-md border focus:border-primary focus:outline-none shadow-sm text-gray-700"
              id="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a role</option>
              {role.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-0.5 font-bold text-sm text-gray-700"
            >
              Password
            </label>
            <div className="relative w-full">
              <input
                className="w-full h-8  px-4 placeholder:text-sm rounded-md border focus:border-primary focus:outline-none shadow-sm text-gray-700"
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={handleShowPassword}
              >
                <ShowPasswordIcon showPassword={showPassword} />
              </span>

              <span className="absolute left-0 top-6 transform translate-y-1/2 cursor-pointer">
                {formData.password && ValidatePasswordLength && (
                  <span
                    className="text-red-500 text-xs font-semibold"
                    style={{ letterSpacing: "1px" }}
                  >
                    Pasword must be greater or equals to 8
                  </span>
                )}
              </span>
            </div>
          </div>
          <div>
            <label
              htmlFor="passwordConfirm"
              className="block mb-0.5 font-bold text-sm text-gray-700"
            >
              Confirm Password
            </label>
            <div className="relative w-full">
              <input
                className="w-full h-8  px-4 placeholder:text-sm rounded-md border focus:border-primary focus:outline-none shadow-sm text-gray-700"
                id="passwordConfirm"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.passwordConfirm}
                onChange={handleInputChange}
                required
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={handleShowPassword}
              >
                <ShowPasswordIcon showPassword={showPassword} />
              </span>
              <span className="absolute left-0 top-6 transform translate-y-1/2 cursor-pointer">
                {!isPasswordMatch && (
                  <span
                    className="text-red-500 text-xs font-semibold"
                    style={{ letterSpacing: "1px" }}
                  >
                    Passwords do not match
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full h-8  flex justify-center items-center ${
            isPending || !isPasswordMatch || ValidatePasswordLength
              ? "bg-gray-300"
              : "bg-buttonColor hover:bg-buttonColorHover"
          } text-white rounded-md shadow-md`}
          disabled={isPending || !isPasswordMatch || ValidatePasswordLength}
        >
          {isPending ? <SpinnerMini /> : "Add User"}
        </button>
      </form>
    </div>
  );
};

export default AddUserForm;

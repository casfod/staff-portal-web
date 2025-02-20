import { FormEvent, useState } from "react";
import { UserType } from "../../interfaces";
import { useAddUser } from "./useAddUser";
import SpinnerMini from "../../ui/SpinnerMini";
import ShowPasswordIcon from "../../ui/ShowPasswordIcon";

const role = [
  { id: "ADMIN", name: "ADMIN" },
  { id: "STAFF", name: "STAFF" },
];

const AddUserForm = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<UserType>>({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    password: "",
    passwordConfirm: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const { addUser, isPending } = useAddUser();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    console.log(formData, "Form Data");

    addUser(formData);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full md:w-[400px] flex flex-col items-center justify-center py-2">
      <h2 className="text-lg text-center font-medium text-gray-900 mb-4">
        Add New User
      </h2>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center gap-4 sm:gap-7 bg-white bg-opacity-90 px-4  md:px-6 rounded-md shadow-xl backdrop-blur-lg md:mx-0"
      >
        <div className="flex flex-col w-full gap-4">
          <div>
            <label
              htmlFor="first_name"
              className="block mb-1 font-bold text-gray-700"
            >
              First Name
            </label>
            <input
              className="w-full h-8 md:h-10 px-4 rounded-md border focus:border-secondary focus:outline-none shadow-sm text-gray-700"
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
              className="block mb-1 font-bold text-gray-700"
            >
              Last Name
            </label>
            <input
              className="w-full h-8 md:h-10 px-4 rounded-md border focus:border-secondary focus:outline-none shadow-sm text-gray-700"
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
              className="block mb-1 font-bold text-gray-700"
            >
              Email
            </label>
            <input
              className="w-full h-8 md:h-10 px-4 rounded-md border focus:border-secondary focus:outline-none shadow-sm text-gray-700"
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
              className="block mb-1 font-bold text-gray-700"
            >
              Roles
            </label>
            <select
              className="w-full h-8 md:h-10 px-4 rounded-md border focus:border-secondary focus:outline-none shadow-sm text-gray-700"
              id="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a station</option>
              {role.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1 font-bold text-gray-700"
            >
              Password
            </label>
            <div className="relative w-full">
              <input
                className="w-full h-8 md:h-10 px-4 rounded-md border focus:border-secondary focus:outline-none shadow-sm text-gray-700"
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
            </div>
          </div>
          <div>
            <label
              htmlFor="passwordConfirm"
              className="block mb-1 font-bold text-gray-700"
            >
              Confirm Password
            </label>
            <div className="relative w-full">
              <input
                className="w-full h-8 md:h-10 px-4 rounded-md border focus:border-secondary focus:outline-none shadow-sm text-gray-700"
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
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-8 md:h-10 flex justify-center items-center bg-buttonColor hover:bg-buttonColorHover text-white rounded-md shadow-md"
          disabled={isPending}
        >
          {isPending ? <SpinnerMini /> : "Add User"}
        </button>
      </form>
    </div>
  );
};

export default AddUserForm;

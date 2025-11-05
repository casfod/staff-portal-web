import { FormEvent, useEffect, useState } from "react";
import { UserType } from "../../interfaces";
import { useAddUser } from "./Hooks/useAddUser";
import SpinnerMini from "../../ui/SpinnerMini";
import ShowPasswordIcon from "../../ui/ShowPasswordIcon";
import { CustomSelect } from "../../ui/CustomSelect";

export const role = ["ADMIN", "REVIEWER", "STAFF"];

export const positions = [
  "Executive Director",
  "Head of Program and Grant",
  "Supply Chain Coordinator",
  "Partnership and Reporting Coordinator",
  "Project Coordinator",
  "Education Officer",
  "Protection Officer",
  "MEAL Senior Officer",
  "MHPSS Officer",
  "Protection Coordinator",
  "Education Coordinator",
  "Nutrition Coordinator",
  "Livelihood Lead",
  "Gender and Disability Inclusion Lead",
  "Finance Officer",
  "State Head of Operation",
  "Procurement Officer",
  "Logistic and Fleet Management Officer",
  "Human Resource Coordinator",
  "Education Assistant",
  "Nutrition Manager",
  "Nutrition Assistant",
  "CMAM Provider",
  "CMAM Screener",
  "MICYN Screener",
  "CFM Officer",
  "AAP/CFM Facilitator",
  "Data Clerk",
  "GBV Case Worker",
  "GVB Case Worker",
  "MHPSS Councillor",
  "Communication Officer",
  "Safety and Security Adviser",
  "Communication Intern",
  "IT Associate",
  "Store Keeper",
  "Supply Chain Intern",
  "Finance and Admin Associate",
  "Driver",
  "Cleaner",
  "Media Officer",
  "Protection Assistant",
  "Education Associate",
  "Media Associate",
  "Protection Intern",
  "Education Volunteer",
  "Program Intern",
  "Logistic Assistant",
  "WASH Associate",
  "Media Intern",
  "MHPSS Intern",
  "Health Intern",
  "Finance Assistant",
];

const AddUserForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordMatch, setIsPasswordMatch] = useState(false);
  const [formData, setFormData] = useState<Partial<UserType>>({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    position: "",
    password: "",
    passwordConfirm: "",
    procurementRole: {
      canCreate: false,
      canView: false,
      canUpdate: false,
      canDelete: false,
    },
    financeRole: {
      canCreate: false,
      canView: false,
      canUpdate: false,
      canDelete: false,
    },
  });

  const { addUser, isPending } = useAddUser();

  // Validate password match
  useEffect(() => {
    setIsPasswordMatch(formData.password === formData.passwordConfirm);
  }, [formData.password, formData.passwordConfirm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof UserType) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    addUser(formData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const isPasswordValid = (formData.password?.length || 0) >= 8;
  const canSubmit = isPasswordMatch && isPasswordValid && !isPending;

  return (
    <div className="w-[300px] md:w-[350px] flex flex-col items-center justify-center py-4 rounded-lg">
      <h2 className="text-center font-medium mb-2">Add New User</h2>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center gap-3 sm:gap-4 bg-white bg-opacity-90 px-4 md:px-5 rounded-md"
      >
        <div className="flex flex-col w-full gap-3">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="first_name"
                className="block mb-1 font-bold text-sm"
              >
                First Name
              </label>
              <input
                className="w-full h-9 px-3 text-sm rounded-md border border-gray-300 focus:border-primary focus:outline-none shadow-sm"
                id="first_name"
                type="text"
                placeholder="First name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                disabled={isPending}
              />
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="block mb-1 font-bold text-sm"
              >
                Last Name
              </label>
              <input
                className="w-full h-9 px-3 text-sm rounded-md border border-gray-300 focus:border-primary focus:outline-none shadow-sm"
                id="last_name"
                type="text"
                placeholder="Last name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                disabled={isPending}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-1 font-bold text-sm">
              Email
            </label>
            <input
              className="w-full h-9 px-3 text-sm rounded-md border border-gray-300 focus:border-primary focus:outline-none shadow-sm"
              id="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isPending}
            />
          </div>

          {/* Position and Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-bold text-sm">Position</label>
              <CustomSelect
                value={formData.position || ""}
                onChange={handleSelectChange("position")}
                options={positions}
                placeholder="Select position"
                required
                // disabled={isPending}
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-sm">User Role</label>
              <CustomSelect
                value={formData.role || ""}
                onChange={handleSelectChange("role")}
                options={role}
                placeholder="Select role"
                required
                // disabled={isPending}
              />
            </div>
          </div>

          {/* Password Fields */}
          <div>
            <label htmlFor="password" className="block mb-1 font-bold text-sm">
              Password
            </label>
            <div className="relative">
              <input
                className="w-full h-9 px-3 pr-10 text-sm rounded-md border border-gray-300 focus:border-primary focus:outline-none shadow-sm"
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isPending}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={togglePasswordVisibility}
                disabled={isPending}
              >
                <ShowPasswordIcon showPassword={showPassword} />
              </button>
              {formData.password && !isPasswordValid && (
                <p className="text-red-500 text-xs mt-1">
                  Password must be at least 8 characters
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="passwordConfirm"
              className="block mb-1 font-bold text-sm"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                className="w-full h-9 px-3 pr-10 text-sm rounded-md border border-gray-300 focus:border-primary focus:outline-none shadow-sm"
                id="passwordConfirm"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={formData.passwordConfirm}
                onChange={handleInputChange}
                required
                disabled={isPending}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={togglePasswordVisibility}
                disabled={isPending}
              >
                <ShowPasswordIcon showPassword={showPassword} />
              </button>
              {formData.passwordConfirm && !isPasswordMatch && (
                <p className="text-red-500 text-xs mt-1">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full h-9 flex justify-center items-center text-sm font-medium rounded-md shadow-sm transition-colors ${
            canSubmit
              ? "bg-buttonColor hover:bg-buttonColorHover text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!canSubmit}
        >
          {isPending ? <SpinnerMini /> : "Add User"}
        </button>
      </form>
    </div>
  );
};

export default AddUserForm;

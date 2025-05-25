import { FormEvent, useState } from "react";
import ShowPasswordIcon from "../../ui/ShowPasswordIcon";
import SpinnerMini from "../../ui/SpinnerMini";

import { NavLink, useParams } from "react-router-dom";
import { useResetPassword } from "./authHooks/useResetPassword";
import { PasswordResetTypes } from "../../interfaces";
import logo from "../../assets/logo.webp";

const ResetPasswordForm: React.FC = () => {
  const [formData, setFormData] = useState<PasswordResetTypes>({
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { token } = useParams<{ token: string }>();
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value.trim() }));
  };
  const { resetPassword, isPending } = useResetPassword(token!);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    resetPassword({
      password: formData.passwordConfirm,
      passwordConfirm: formData.passwordConfirm,
    });
  };
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div
      className="h-screen flex flex-col items-center justify-center 
      bg-gradient-to-br  from-blue-500 to-primary overflow-y-scroll 
    font-roboto tracking-wide  text-white px-3 md:px-8 pt-16"
    >
      <div className="w-full md:w-[450px] bg-white  flex flex-col items-center justify-center p-4 md:p-6  shadow-xl rounded-md ">
        <div className="flex items-center justify-center mb-4">
          <img className="w-[190px] h-auto" src={logo} alt="Casfod logo" />
        </div>
        <h2
          className="text-lg md:text-2xl font-bold md:font-extrabold text-center text-primary mb-4"
          style={{ fontFamily: "Lato", letterSpacing: "3.5px" }}
        >
          CASFOD POSSIBILITY HUB
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4  md:gap-6 
          w-full max-w-md  
         backdrop-blur-lg  mx-4 md:mx-0"
        >
          {" "}
          <div className="flex flex-col w-full gap-4">
            {" "}
            <div>
              {" "}
              <label htmlFor="password" className="block mb-1 font-bold  ">
                {" "}
                Password{" "}
              </label>{" "}
              <div className="relative w-full">
                {" "}
                <input
                  className="w-full h-8 md:h-10 font-semibold placeholder:font-semibold px-4 rounded-md border 
                  focus:border-[#052859] focus:outline-none shadow-lg 
                   "
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />{" "}
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  onClick={handleShowPassword}
                >
                  {" "}
                  <ShowPasswordIcon showPassword={showPassword} />{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <div>
              {" "}
              <label
                htmlFor="passwordConfirm"
                className="block mb-1 font-bold  "
              >
                {" "}
                Confirm Password{" "}
              </label>{" "}
              <div className="relative w-full">
                {" "}
                <input
                  className="w-full h-8 md:h-10 font-semibold placeholder:font-semibold px-4 rounded-md border 
                  focus:border-[#052859] focus:outline-none shadow-lg 
                   "
                  id="passwordConfirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.passwordConfirm}
                  onChange={handleInputChange}
                  required
                />{" "}
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  onClick={handleShowPassword}
                >
                  {" "}
                  <ShowPasswordIcon showPassword={showPassword} />{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-primary hover:bg-opacity-95"
            disabled={isPending}
          >
            {" "}
            {isPending ? <SpinnerMini /> : "Reset password"}{" "}
          </button>{" "}
        </form>{" "}
      </div>{" "}
      <div className="flex justify-center md:w-[450px] text-sm  text-gray-50 font-semibold text-end mt-3 ">
        <p>
          Want to login?{" "}
          <span className="underline">
            <NavLink to={"/login"}>Click here.</NavLink>{" "}
          </span>
        </p>
      </div>
      <p className="inline-flex items-center gap-1 text-sm md:text-base text-gray-50 font-semibold text-center mt-8 ">
        <span>&copy; 2025 Casfod Possibility Hub. All rights reserved.</span>
      </p>
    </div>
  );
};

export default ResetPasswordForm;

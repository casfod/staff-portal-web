import React, { useState } from "react";
import { useLogin } from "./authHooks/useLogin";
import SpinnerMini from "../../ui/SpinnerMini";
import logo from "../../assets/logo.webp";
import ShowPasswordIcon from "../../ui/ShowPasswordIcon";
import { NavLink } from "react-router-dom";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();
  //   login(formData);
  // };

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
          <div className="flex flex-col w-full gap-4">
            <div>
              <label htmlFor="email" className="block mb-1 font-bold  ">
                Email
              </label>
              <input
                className="w-full h-8 md:h-10 font-semibold placeholder:font-semibold px-4 rounded-md border 
                focus:border-[#052859] focus:outline-none shadow-lg 
                 "
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-1 font-bold  ">
                Password
              </label>
              <div className="relative w-full">
                <input
                  className="w-full h-8 md:h-10 font-semibold placeholder:font-semibold px-4 rounded-md border 
                  focus:border-[#052859] focus:outline-none shadow-lg 
                   "
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 
                  cursor-pointer"
                  onClick={handleShowPassword}
                >
                  <ShowPasswordIcon showPassword={showPassword} />
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-primary hover:bg-opacity-95"
          >
            {isPending ? <SpinnerMini /> : " Sign In"}
          </button>
        </form>
      </div>

      <div className="flex justify-center md:w-[450px] text-sm  text-gray-50 font-semibold text-center mt-3 ">
        <p>
          Forgot password?{" "}
          <span className="underline">
            <NavLink to={"/forgot-password"}>Click here.</NavLink>{" "}
          </span>
        </p>
      </div>
      <p className="inline-flex items-center gap-1 text-sm md:text-base text-gray-50 font-semibold text-center mt-8 ">
        <span>&copy; 2025 Casfod Possibility Hub. All rights reserved.</span>
      </p>
    </div>
  );
}

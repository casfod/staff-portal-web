import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { addUser as addUserApi } from "../../services/apiAuth.ts";
import { AxiosError, AxiosResponse } from "axios";

import Cookies from "js-cookie";
import { UserType } from "../../interfaces.ts";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useAddUser() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: addUser,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<UserType>) => addUserApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        const userData = data.data.user;

        // Clear React Query cache and reset headers
        queryClient.clear();

        // Set JWT token in cookies
        Cookies.set(`token-${userData.id}`, data.data.token, {
          expires: 7,
          secure: true,
          sameSite: "strict",
        });

        // Set current user in sessionStorage
        sessionStorage.setItem("currentSessionUser", JSON.stringify(userData));
        sessionStorage.setItem(`token-${userData.id}`, data.data.token);

        toast.success(`Signup sucessful`);

        // Redirect to the home page
        navigate("/home", { replace: true });
      } else {
        toast.error(`${data.message}`);

        console.error("Login Error:", data.message);
      }
    },

    onError: (err: LoginError) => {
      toast.error(`${err.response?.data.message}` || "An error occurred");

      const error = err.response?.data.message;
      console.error("Login Error:", error);
    },
  });

  return { addUser, isPending, isError };
}

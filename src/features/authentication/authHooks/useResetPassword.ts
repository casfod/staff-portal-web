import { useMutation } from "@tanstack/react-query";
import { resetPassword as resetPasswordApi } from "../../../services/apiAuth.ts";
import { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PasswordResetTypes } from "../../../interfaces.ts";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useResetPassword(token: string) {
  const navigate = useNavigate();

  const {
    mutate: resetPassword,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ password, confirm_password }: PasswordResetTypes) =>
      resetPasswordApi(token, { password, confirm_password }),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Password reset successful");

        navigate("/auth", { replace: true });
      } else {
        toast.error(`${data.message}`);

        console.error("resetPassword Error:", data.message);
      }
    },

    onError: (err: LoginError) => {
      toast.error(`${err.response?.data.message}` || "An error occurred");

      const error = err.response?.data.message;
      console.error("resetPassword Error:", error);
    },
  });

  return { resetPassword, isPending, isError };
}

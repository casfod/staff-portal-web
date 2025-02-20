import { useMutation } from "@tanstack/react-query";
import { forgotPassword as forgotPasswordApi } from "../../services/apiAuth.ts";
import { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-hot-toast";
import { PasswordForgotTypes } from "../../interfaces.ts";

interface ErrorResponse {
  message: string;
}

interface UseforgotPasswordType {
  data: PasswordForgotTypes;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useforgotPassword() {
  const {
    mutate: forgotPassword,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ data }: UseforgotPasswordType) => forgotPasswordApi(data),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Successful! please check your mail.");
      } else {
        toast.error(`${data.message}`);

        console.error("forgotPassword Error:", data.message);
      }
    },

    onError: (err: LoginError) => {
      toast.error(`${err.response?.data.message}` || "An error occurred");

      const error = err.response?.data.message;
      console.error("forgotPassword Error:", error);
    },
  });

  return { forgotPassword, isPending, isError };
}

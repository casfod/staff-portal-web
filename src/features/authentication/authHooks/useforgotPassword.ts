import { useMutation } from "@tanstack/react-query";
import { forgotPassword as forgotPasswordApi } from "../../../services/apiAuth.ts";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { UserType } from "../../../interfaces.ts";

interface ErrorResponse {
  message: string;
}

interface UseforgotPasswordType {
  data: UserType;
}

// interface LoginError extends AxiosError {
//   response?: AxiosResponse<ErrorResponse>;
// }

type LoginError = AxiosError<ErrorResponse>;

export function useForgotPassword() {
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
      console.error("forgotPassword Error:", err.response?.data.message);
    },
  });

  return { forgotPassword, isPending, isError };
}

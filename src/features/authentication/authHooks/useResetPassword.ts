import { useMutation } from "@tanstack/react-query";
import { resetPassword as resetPasswordApi } from "../../../services/apiAuth.ts";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PasswordResetTypes } from "../../../interfaces.ts";

export function useResetPassword(token: string) {
  const navigate = useNavigate();

  const {
    mutate: resetPassword,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ password, passwordConfirm }: PasswordResetTypes) =>
      resetPasswordApi(token, { password, passwordConfirm }),

    onSuccess: (data) => {
      if (data.status === "success") {
        // console.log(data.data.user);
        toast.success("Password reset successful");

        navigate("/login", { replace: true });
      } else {
        toast.error(`${data.message}`);
        console.error("resetPassword Error:", data.message);
      }
    },

    onError: (err) => {
      toast.error("Network or server error");
      console.log("ERROR", err);
    },
  });

  return { resetPassword, isPending, isError };
}

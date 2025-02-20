import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { login as loginApi } from "../../services/apiAuth";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isPending } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onSuccess: (data) => {
      if (data.status === "success") {
        // console.log(data.data.user);

        const userData = data.data.user;

        // Clear React Query cache and reset headers
        queryClient.clear();

        // Set JWT token in cookies
        Cookies.set(`token-${userData.id}`, data.token, {
          expires: 7,
          secure: true,
          sameSite: "strict",
        });

        // Set current user in sessionStorage
        localStorage.setItem("currentLocalUser", JSON.stringify(userData));
        localStorage.setItem(`token-${userData.id}`, data.token);

        // Refetch queries after updating token
        queryClient.setQueryData([`user-${userData.id}`] as any, userData);
        // queryClient.invalidateQueries(["orders"] as any);

        toast.success(`Login sucessful`);

        // Redirect to the home page
        navigate("/dashboard", { replace: true });
      } else {
        toast.error(`${data.message}`);
        console.error("Login Error:", data.message);
      }
    },

    onError: (err) => {
      toast.error("Network or server error");
      console.log("ERROR", err);
    },
  });

  return { login, isPending };
}

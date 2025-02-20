import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { logout as logOutApi } from "../../services/apiAuth";
import { localStorageUser } from "../../utils/localStorageUser";

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: logout, isPending } = useMutation({
    mutationFn: logOutApi,
    onSuccess: () => {
      // Clear sessionStorage
      localStorage.removeItem("currentLocalUser");
      localStorage.clear();

      // Clear cookies
      Cookies.remove(`token-${localStorageUser()?.id}`);

      // Clear React Query cache
      queryClient.clear();
      // Redirect to the auth (login) page
      navigate("/login", { replace: true });
    },
  });

  return { logout, isPending };
}

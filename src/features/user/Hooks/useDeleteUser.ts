import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { deleteUser as deleteUserApi } from "../../../services/apiUser";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface HookError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  const {
    mutate: deleteUser,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<void, HookError, string>({
    mutationFn: async (userID: string) => {
      await deleteUserApi(userID);
    },
    onSuccess: (data) => {
      console.log(data);

      toast.success("User deleted");

      queryClient.invalidateQueries([`users`] as any);
    },

    onError: (error) => {
      toast.error("Error deleting User");

      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the user.";
      console.error("Delete user Error:", errorMessage);
    },
  });

  return {
    deleteUser,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}

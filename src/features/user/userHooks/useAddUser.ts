import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUser as addUserApi } from "../../../services/apiUser.ts";
import { AxiosError, AxiosResponse } from "axios";
import { closeModal } from "../../../store/modalSlice.ts";
import { UserType } from "../../../interfaces.ts";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useAddUser() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const {
    mutate: addUser,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<UserType>) => addUserApi(data),

    onSuccess: (data) => {
      if (data.status !== "error") {
        // Close the modal
        dispatch(closeModal());

        // Show success toast
        toast.success("User added successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        // Handle unexpected response
        toast.error(data.message);
      }
    },

    onError: (err: LoginError) => {
      // Show error toast
      toast.error(err.response?.data.message || "An error occurred");

      // Log the error for debugging
      console.error("Add User Error:", err.response?.data.message);
    },
  });

  return { addUser, isPending, isError };
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";

import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { updateUserAdmin as updateUserAdminAPI } from "../../../services/apiUser";
import toast from "react-hot-toast";
import { UserType } from "../../../interfaces";

interface ErrorResponse {
  message: string; // Assuming the error response has a 'message' field
  // Add any other properties that might be in the error response
}

interface Error extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useUpdateUser(id: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: UpdateUser,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<UserType>) => updateUserAdminAPI(id, data),

    onSuccess: (data) => {
      if (data.status === 200) {
        queryClient.invalidateQueries(["users"] as any);
        toast.success("User updated");
      }
    },

    onError: (err: Error) => {
      // Check if the error has a response, if so, display it
      toast.error("Error updating user");

      const error = err.response?.data.message || "An error occurred";

      console.error("Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { UpdateUser, isPending, isError, errorMessage };
}

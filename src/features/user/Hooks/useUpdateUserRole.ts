import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";

import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { updateUserRole as updateUserRoleAPI } from "../../../services/apiUser";
import toast from "react-hot-toast";
import { UserType } from "../../../interfaces";

interface ErrorResponse {
  message: string; // Assuming the error response has a 'message' field
  // Add any other properties that might be in the error response
}

interface Error extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useUpdateUserRole(id: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: UpdateUserRole,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<UserType>) => updateUserRoleAPI(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries(["users"] as any);
      toast.success("User role updated");
    },

    onError: (err: Error) => {
      // Check if the error has a response, if so, display it
      toast.error("Error updating user role");

      const error = err.response?.data.message || "An error occurred";

      console.error("Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { UpdateUserRole, isPending, isError, errorMessage };
}

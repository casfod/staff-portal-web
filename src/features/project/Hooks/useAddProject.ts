import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProject as savePurchaseRequestsApi } from "../../../services/apiProject.ts";
import { AxiosError, AxiosResponse } from "axios";
import { Project } from "../../../interfaces.ts";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useAddProject() {
  const queryClient = useQueryClient();

  const {
    mutate: addProject,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<Project>) => savePurchaseRequestsApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("Project created successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      } else {
        // Handle unexpected response
        toast.error(data.message);
      }
    },

    onError: (err: LoginError) => {
      // Show error toast
      toast.error(err.response?.data.message || "An error occurred");

      // Log the error for debugging
      console.error("Error creating Project:", err.response?.data.message);
    },
  });

  return { addProject, isPending, isError };
}

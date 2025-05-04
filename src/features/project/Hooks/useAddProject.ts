import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProject as savePurchaseRequestsApi } from "../../../services/apiProject.ts";
import { AxiosError, AxiosResponse } from "axios";
import { Project } from "../../../interfaces.ts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useAddProject() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: addProject,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ data, files }: { data: Partial<Project>; files: File[] }) =>
      savePurchaseRequestsApi(data, files),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("Project created successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        navigate(-1);
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

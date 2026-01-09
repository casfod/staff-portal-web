import { useMutation } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";

import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { updateProject as updateProjectApi } from "../../../services/apiProject.ts";
import { Project } from "../../../interfaces.ts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface HookError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useUpdateProject(projectId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    mutate: updateProject,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ data, files }: { data: Partial<Project>; files: File[] }) =>
      updateProjectApi(projectId, data, files),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Project updated successfully");

        navigate(-1);
      } else if (data.status !== 200) {
        toast.error("Project update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message); // Log error directly here
      }
    },

    onError: (err: HookError) => {
      toast.error("Error updating Project");
      const error = err.response?.data.message || "An error occurred";

      console.error("Project update Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updateProject, isPending, isError, errorMessage };
}

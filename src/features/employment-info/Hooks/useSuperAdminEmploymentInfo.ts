// src/features/employment-info/Hooks/useSuperAdminUpdateEmploymentInfo.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminUpdateUserEmploymentInfo } from "../../../services/apiEmploymentInfo";
import { EmploymentInfoType } from "../../../interfaces";
import toast from "react-hot-toast";

export function useSuperAdminUpdateEmploymentInfo() {
  const queryClient = useQueryClient();

  const {
    mutate: superAdminUpdate,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<EmploymentInfoType>;
    }) => superAdminUpdateUserEmploymentInfo(userId, data),

    onSuccess: (data) => {
      if (data?.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["user"] });
        toast.success("Employment information updated successfully");
      } else {
        toast.error(data?.message || "Failed to update employment information");
      }
    },

    onError: (error: any) => {
      const message = error.response?.data?.message || "An error occurred";
      toast.error(message);
      console.error("Super Admin Update Error:", message);
    },
  });

  return { superAdminUpdate, isPending, isError, error };
}

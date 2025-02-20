import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUser as addUserApi } from "../../../services/apiUser.ts";
import { AxiosError, AxiosResponse } from "axios";

import { UserType } from "../../../interfaces.ts";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useAddUser() {
  const queryClient = useQueryClient();

  const {
    mutate: addUser,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<UserType>) => addUserApi(data),

    onSuccess: () => {
      toast.success(`User added sucessfully`);

      queryClient.invalidateQueries([`users`] as any);
    },

    onError: (err: LoginError) => {
      toast.error(`${err.response?.data.message}` || "An error occurred");

      const error = err.response?.data.message;
      console.error("Login Error:", error);
    },
  });

  return { addUser, isPending, isError };
}

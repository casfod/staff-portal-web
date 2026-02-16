import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useAdminsType, UserType, useUsersType } from "../../../interfaces";
import {
  getUsers,
  getAdmins,
  getReviewers,
  addUser as addUserApi,
  updateUserAdmin as updateUserAdminAPI,
  deleteUser as deleteUserApi,
  getUserById,
} from "../../../services/apiUser";
import { getUser } from "../../../services/apiAuth";
import { useDispatch } from "react-redux";
import { closeModal } from "../../../store/modalSlice.ts";

import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

interface useUserType {
  status: number;
  message: string;
  data: UserType;
}

interface ErrorResponse {
  message: string;
}

interface HookError extends AxiosError {
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
      if (data.status === 200) {
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

    onError: (err: HookError) => {
      // Show error toast
      toast.error(err.response?.data.message || "An error occurred");

      // Log the error for debugging
      console.error("Add User Error:", err.response?.data.message);
    },
  });

  return { addUser, isPending, isError };
}

export function useAdmins(
  options?: UseQueryOptions<useAdminsType, Error> // Add options parameter
) {
  return useQuery<useAdminsType, Error>({
    queryKey: ["admins"],
    queryFn: () => getAdmins(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

export function useUsers({
  search,
  sort,
  page,
  limit,
  options,
}: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  options?: UseQueryOptions<useUsersType, Error>;
}) {
  return useQuery<useUsersType, Error>({
    queryKey: ["users", search, sort, page, limit],
    queryFn: () => getUsers({ search, sort, page, limit }),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

export function useUser(id: string) {
  return useQuery<useUserType, Error>({
    queryKey: ["user", id],
    queryFn: getUser,
    staleTime: 0,
  });
}
export function useUserById(id: string) {
  return useQuery<useUserType, Error>({
    queryKey: [`user-${id}`, id],
    queryFn: () => getUserById(id),
    staleTime: 0,
  });
}

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

export function useReviewers(
  options?: UseQueryOptions<useAdminsType, Error> // Add options parameter
) {
  return useQuery<useAdminsType, Error>({
    queryKey: ["reviewers"],
    queryFn: () => getReviewers(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
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

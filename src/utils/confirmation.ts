import { UseMutationResult } from "@tanstack/react-query";
import Swal from "sweetalert2";

interface ConfirmationOptions {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  customClass?: Record<string, string>;
}

interface UpdateStatusOptions<T> {
  data: T;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export async function withConfirmation<T>(
  action: (data: T) => Promise<any>,
  options: ConfirmationOptions & UpdateStatusOptions<T>
) {
  const {
    title = "Are you sure?",
    text = "Do you want to proceed with this action?",
    confirmButtonText = "Yes, proceed!",
    confirmButtonColor = "#1373B0",
    cancelButtonColor = "#DC3340",
    customClass = { popup: "custom-style" },
    data,
    onSuccess,
    onError,
  } = options;

  const result = await Swal.fire({
    title,
    text,
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor,
    confirmButtonText,
    customClass,
  });

  if (result.isConfirmed) {
    try {
      await action(data);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
      Swal.fire(
        "Error!",
        error instanceof Error ? error.message : "An error occurred",
        "error"
      );
    }
  }
}

export async function withMutationConfirmation<T>(
  mutation: UseMutationResult<any, any, T>,
  options: ConfirmationOptions & { data: T }
) {
  const {
    title = "Are you sure?",
    text = "Do you want to proceed?",
    confirmButtonText = "Confirm",
    data,
    customClass = { popup: "custom-style" },
  } = options;

  const result = await Swal.fire({
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: "#1373B0",
    cancelButtonColor: "#DC3340",
    confirmButtonText,
    customClass,
  });

  if (result.isConfirmed) {
    mutation.mutate(data);
  }
}

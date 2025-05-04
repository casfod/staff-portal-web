// src/hooks/useConfirmation.ts
import { useCallback } from "react";
import Swal from "sweetalert2";

export function useConfirmation() {
  return useCallback(
    async <T>(
      action: (data: T) => Promise<any>,
      options: {
        title?: string;
        text?: string;
        confirmText?: string;
        data: T;
        onSuccess?: () => void;
        onError?: (error: any) => void;
      }
    ) => {
      const {
        title = "Are you sure?",
        text = "Do you want to proceed?",
        confirmText = "Confirm",
        data,
        onSuccess,
        onError,
      } = options;

      const result = await Swal.fire({
        title,
        text,
        showCancelButton: true,
        confirmButtonColor: "#1373B0",
        cancelButtonColor: "#DC3340",
        confirmButtonText: confirmText,
        customClass: { popup: "custom-style" },
      });

      if (result.isConfirmed) {
        try {
          await action(data);
          onSuccess?.();
        } catch (error) {
          onError?.(error);
          Swal.fire(
            "Error!",
            error instanceof Error ? error.message : "Action failed",
            "error"
          );
        }
      }
    },
    []
  );
}

import { useCallback } from "react";
import Swal from "sweetalert2";

type DeleteFunction = (
  id: string,
  options: { onError: (error: Error) => void }
) => void;

interface UseDeleteOptions {
  entityName: string;
  customClass?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  confirmButtonText?: string;
}

const useDeleteRequest = (
  deleteFunction: DeleteFunction,
  options: UseDeleteOptions
) => {
  const {
    entityName,
    customClass = "custom-style",
    confirmButtonColor = "#1373B0",
    cancelButtonColor = "#DC3340",
    confirmButtonText = "Yes, delete it!",
  } = options;

  return useCallback(
    (id: string) => {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you want to delete this ${entityName}?`,
        showCancelButton: true,
        confirmButtonColor,
        cancelButtonColor,
        confirmButtonText,
        customClass: { popup: customClass },
      }).then((result) => {
        if (result.isConfirmed) {
          deleteFunction(id, {
            onError: (error) => {
              Swal.fire("Error!", error.message, "error");
            },
          });
        }
      });
    },
    [
      deleteFunction,
      entityName,
      confirmButtonColor,
      cancelButtonColor,
      confirmButtonText,
      customClass,
    ]
  );
};

export default useDeleteRequest;

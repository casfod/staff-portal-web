// src/hooks/useStatusUpdate.ts
import Swal from "sweetalert2";

export const useStatusUpdate = () => {
  const handleStatusChange = async (
    status: string,
    comment: string,
    updateFn: (data: { status: string; comment: string }) => Promise<void>
  ) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to change this request status?",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: "Yes, update it!",
      customClass: { popup: "custom-style" },
    });

    if (result.isConfirmed) {
      try {
        await updateFn({ status, comment });
      } catch (error) {
        Swal.fire("Error!", (error as Error).message, "error");
        throw error;
      }
    }
  };

  return { handleStatusChange };
};

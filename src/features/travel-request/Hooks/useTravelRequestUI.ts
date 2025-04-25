import { useCallback, useState } from "react";
import { TravelRequestType } from "../../../interfaces";
import { setTravelRequest } from "../../../store/travelRequestSlice";
import Swal from "sweetalert2";
import { AppDispatch } from "../../../store/store";
import { NavigateFunction } from "react-router-dom";

type DeleteTravelRequestFn = (
  id: string,
  options: { onError: (error: { message: string }) => void }
) => void;

interface UseTravelRequestUIOptions {
  dispatch: AppDispatch;
  navigate: NavigateFunction;
  deleteTravelRequest: DeleteTravelRequestFn;
}

export const useTravelRequestUI = ({
  dispatch,
  navigate,
  deleteTravelRequest,
}: UseTravelRequestUIOptions) => {
  const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>({});

  const toggleViewItems = useCallback((id: string) => {
    setVisibleItems((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleNavigation = useCallback(
    (request: TravelRequestType, path: "request" | "edit-request") => {
      dispatch(setTravelRequest(request));
      navigate(`/travel-requests/${path}/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleAction = useCallback(
    (request: TravelRequestType) => handleNavigation(request, "request"),
    [handleNavigation]
  );

  const handleEdit = useCallback(
    (request: TravelRequestType) => handleNavigation(request, "edit-request"),
    [handleNavigation]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this Travel Request?",
        showCancelButton: true,
        confirmButtonColor: "#1373B0",
        cancelButtonColor: "#DC3340",
        confirmButtonText: "Yes, delete it!",
        customClass: { popup: "custom-style" },
      });

      if (result.isConfirmed) {
        try {
          deleteTravelRequest(id, {
            onError: (error) => {
              Swal.fire("Error!", error.message, "error");
            },
          });
        } catch (error) {
          Swal.fire("Error!", "Failed to delete travel request", "error");
        }
      }
    },
    [deleteTravelRequest]
  );

  return {
    visibleItems,
    toggleViewItems,
    handleAction,
    handleEdit,
    handleDelete,
  };
};

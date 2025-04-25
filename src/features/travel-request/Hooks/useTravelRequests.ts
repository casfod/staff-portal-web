import { useSelector } from "react-redux";
import { useAllTravelRequests } from "./useAllTravelRequests";
import { useDeleteTravelRequest } from "./useDeleteTravelRequest";
import { useDebounce } from "use-debounce";
import { RootState } from "../../../store/store";

// hooks/useTravelRequests.ts
export const useTravelRequests = () => {
  const { searchTerm, sort, page, limit } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);

  const { data, ...query } = useAllTravelRequests(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );
  const { deleteTravelRequest } = useDeleteTravelRequest(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  return {
    travelRequests: data?.data?.travelRequests ?? [],
    totalPages: data?.data?.totalPages ?? 1,
    deleteTravelRequest,
    ...query,
  };
};

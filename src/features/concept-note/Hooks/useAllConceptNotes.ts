import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { UseConceptNoteType } from "../../../interfaces";
import { getAllConceptNotes } from "../../../services/apiConceptNotes";

export function useAllConceptNotes(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<UseConceptNoteType, Error> // Add options parameter
) {
  return useQuery<UseConceptNoteType, Error>({
    queryKey: ["all-concept-notes", search, sort, page, limit],
    queryFn: () => getAllConceptNotes({ search, sort, page, limit }),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

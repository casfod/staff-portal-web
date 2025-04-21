import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { getConceptNotesStats } from "../../../services/apiConceptNotes";
import { UseConceptNoteStatsType } from "../../../interfaces";

export function useConceptNotesStats(
  options?: UseQueryOptions<UseConceptNoteStatsType, Error> // Add options parameter
) {
  return useQuery<UseConceptNoteStatsType, Error>({
    queryKey: ["concept-notes-stats"],
    queryFn: () => getConceptNotesStats(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

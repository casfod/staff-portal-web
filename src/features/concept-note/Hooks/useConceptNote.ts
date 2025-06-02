import { useQuery } from "@tanstack/react-query";
import { getConceptNote } from "../../../services/apiConceptNotes";
import { UseConceptNote } from "../../../interfaces";

export function useConceptNote(id: string) {
  return useQuery<UseConceptNote, Error>({
    queryKey: ["concept-note", id],
    queryFn: () => getConceptNote(id),
    staleTime: 0,
  });
}

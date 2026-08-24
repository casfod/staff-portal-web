// ConceptNoteCard.tsx - Card for IConceptNote
import { IConceptNote } from '@/interfaces';
import BaseRequestCard, { RequestCardWrapperProps } from '@/components/custom/BaseRequestCard';
import { getUserFullName } from '@/utils/getUserFullName';

interface ConceptNoteCardProps extends RequestCardWrapperProps {
  conceptNote: IConceptNote;
}

const ConceptNoteCard = ({ conceptNote, requestId, ...rest }: ConceptNoteCardProps) => (
  <BaseRequestCard
    displayName={getUserFullName(conceptNote.createdBy)}
    identifier={conceptNote.cnNumber}
    status={conceptNote.status}
    date={conceptNote.createdAt}
    requestId={requestId ?? conceptNote.id}
    {...rest}
  />
);

export default ConceptNoteCard;

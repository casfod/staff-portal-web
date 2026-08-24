import { useNavigate, useParams } from 'react-router-dom';
import { List } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useEffect } from 'react';
import { Button } from '../../components/ui/button';
import TextHeader from '../../components/custom/TextHeader';
import ConceptNoteForm from './ConceptNoteForm';

const EditConceptNote = () => {
  const navigate = useNavigate();
  const { requestId } = useParams();

  const conceptNote = useSelector((state: RootState) => state.conceptNote.conceptNote);

  useEffect(() => {
    if (!requestId || !conceptNote) {
      navigate('/concept-notes');
    }
  }, [conceptNote, requestId, navigate]);

  if (!conceptNote) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No concept note data available..</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader> Update Concept Note</TextHeader>

          <Button
            onClick={() => navigate(-1)} // Use relative path here
          >
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="border w-full rounded-lg">
        <div className="bg-white bg-opacity-90 py-4 md:py-6 lg:py-10 px-2 md:px-6 lg:px-12 w-full rounded-lg">
          <ConceptNoteForm mode="edit" initialData={conceptNote} />
        </div>
      </div>
    </div>
  );
};

export default EditConceptNote;

// src/features/leave/EditLeave.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { List } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useEffect } from 'react';
import LeaveForm from './LeaveForm';
import { Button } from '../../components/ui/button';
import TextHeader from '../../components/custom/TextHeader';
import { useLeave } from './Hooks/useLeave';
import { DataStateContainer } from '../../components/custom/DataStateContainer';
import Spinner from '../../components/custom/Spinner';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';

const EditLeave = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: remoteData, isLoading, isError } = useLeave(id!);
  const localLeave = useSelector((state: RootState) => state.leave.leave);

  useEffect(() => {
    if (!id || (!isLoading && !remoteData && !localLeave)) {
      navigate('/human-resources/leave');
    }
  }, [remoteData, localLeave, id, navigate, isLoading]);

  const leaveData = remoteData?.data || localLeave;

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Update Leave Application</TextHeader>

          <Button variant="outline" size="sm" onClick={() => navigate('/human-resources/leave')}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <DataStateContainer
        isLoading={isLoading}
        isError={isError}
        data={leaveData}
        errorComponent={<NetworkErrorUI />}
        loadingComponent={<Spinner />}
        emptyComponent={<div>Leave application not found</div>}
      >
        <div className="border w-full rounded-lg">
          <div className="bg-white bg-opacity-90 py-4 md:py-6 lg:py-10 px-2 md:px-6 lg:px-12 w-full rounded-lg">
            <LeaveForm mode="edit" initialData={leaveData} />
          </div>
        </div>
      </DataStateContainer>
    </div>
  );
};

export default EditLeave;
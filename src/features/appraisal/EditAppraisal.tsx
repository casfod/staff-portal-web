// src/features/appraisal/EditAppraisal.tsx
import { List } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { RootState } from '../../store/store';
import { useAppraisal } from './Hooks/useAppraisal';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import Spinner from '../../components/custom/Spinner';
import { DataStateContainer } from '../../components/custom/DataStateContainer';
import TextHeader from '../../components/custom/TextHeader';
import { Button } from '../../components/ui/button';
import AppraisalForm from './AppraisalForm';

const EditAppraisal = () => {
  const navigate = useNavigate();
  const { appraisalId } = useParams();

  const { data: remoteData, isLoading, isError } = useAppraisal(appraisalId!);
  const appraisal = useSelector((state: RootState) => state.appraisal?.appraisal);

  useEffect(() => {
    if (!appraisalId || (!isLoading && !remoteData && !appraisal)) {
      navigate('/human-resources/appraisals');
    }
  }, [remoteData, appraisal, appraisalId, navigate, isLoading]);

  const requestData = remoteData?.data || appraisal;

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Edit Staff Appraisal</TextHeader>
          <Button variant="outline" size="sm" onClick={() => navigate('/human-resources/appraisals')}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <DataStateContainer
        isLoading={isLoading}
        isError={isError}
        data={requestData}
        errorComponent={<NetworkErrorUI />}
        loadingComponent={<Spinner />}
        emptyComponent={<div>Appraisal not found</div>}
      >
        <div className="border w-full rounded-lg">
          <div className="bg-white bg-opacity-90 py-4 md:py-6 lg:py-10 px-2 md:px-6 lg:px-12 w-full rounded-lg">
            <AppraisalForm mode="edit" initialData={requestData} />
          </div>
        </div>
      </DataStateContainer>
    </div>
  );
};

export default EditAppraisal;
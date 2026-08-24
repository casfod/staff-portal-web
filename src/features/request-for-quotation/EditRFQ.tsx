// EditRFQ.tsx - Updated to use RFQForm
import { List } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { RootState } from '../../store/store';
import { useRFQ } from './Hooks/useRFQ';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import Spinner from '../../components/custom/Spinner';
import { DataStateContainer } from '../../components/custom/DataStateContainer';
import TextHeader from '../../components/custom/TextHeader';
import { Button } from '../../components/ui/button';
import RFQForm from './RFQForm';

const EditRFQ = () => {
  const navigate = useNavigate();
  const { rfqId } = useParams();

  const { data: remoteData, isLoading, isError } = useRFQ(rfqId!);
  const rfq = useSelector((state: RootState) => state.rfq.rfq);

  useEffect(() => {
    if (!rfqId || (!isLoading && !remoteData && !rfq)) {
      navigate('/procurement/rfq');
    }
  }, [remoteData, rfq, rfqId, navigate, isLoading]);

  const requestData = remoteData?.data || rfq;

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Edit RFQ</TextHeader>
          <Button variant="outline" size="sm" onClick={() => navigate('/procurement/rfq')}>
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
        emptyComponent={<div>RFQ not found</div>}
      >
        <div className="border w-full rounded-lg">
          <div className="bg-white bg-opacity-90 py-4 md:py-6 lg:py-10 px-2 md:px-6 lg:px-12 w-full rounded-lg">
            <RFQForm mode="edit" initialData={requestData} />
          </div>
        </div>
      </DataStateContainer>
    </div>
  );
};

export default EditRFQ;

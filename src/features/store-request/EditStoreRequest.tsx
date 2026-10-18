import { useEffect } from 'react';
import { List } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../components/ui/button';
import TextHeader from '../../components/custom/TextHeader';
import { RootState } from '../../store/store';
import StoreRequestForm from './StoreRequestForm';

const EditStoreRequest = () => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const storeRequest = useSelector((state: RootState) => state.storeRequest.storeRequest);

  useEffect(() => {
    if (!requestId || !storeRequest || storeRequest.id !== requestId) {
      navigate('/store-requests');
    }
  }, [navigate, requestId, storeRequest]);

  if (!storeRequest || storeRequest.id !== requestId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">No store request data available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky -top-8 z-10 space-y-1.5 border-b bg-[#F8F8F8] pb-3 pt-4 md:pt-6">
        <div className="flex items-center justify-between">
          <TextHeader>Update Store Request</TextHeader>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <List className="mr-1 h-4 w-4 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="w-full rounded-lg border">
        <div className="w-full rounded-lg bg-white bg-opacity-90 px-2 py-4 md:px-6 md:py-6 lg:px-12 lg:py-10">
          <StoreRequestForm mode="edit" initialData={storeRequest} />
        </div>
      </div>
    </div>
  );
};

export default EditStoreRequest;
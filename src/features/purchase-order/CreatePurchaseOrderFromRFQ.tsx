import { List, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import TextHeader from '../../components/custom/TextHeader';
import PurchaseOrderForm from './PurchaseOrderForm';
import { useRFQ } from '../request-for-quotation/Hooks/useRFQ';
import { DataStateContainer } from '../../components/custom/DataStateContainer';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';

const CreatePurchaseOrderFromRFQ = () => {
  const navigate = useNavigate();
  const { rfqId } = useParams();

  // Fetch RFQ data
  const { data: rfqResponse, isLoading, isError } = useRFQ(rfqId!);

  // Extract the RFQ from the response - data contains { rfq: IRFQ }
  const rfq = rfqResponse?.data;

  // Prepare RFQ data for the form
  const rfqData = rfq
    ? {
        rfqTitle: rfq.rfqTitle,
        itemGroups: rfq.itemGroups,
        copiedTo: rfq.copiedTo || [],
        casfodAddressId: rfq.casfodAddressId,
        poDate: rfq.rfqDate, // Use RFQ date as PO date
        deliveryDate: rfq.deadlineDate, // Use deadline as delivery date
      }
    : undefined;

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Create Purchase Order from RFQ</TextHeader>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="border w-full rounded-lg">
        <div className="bg-white bg-opacity-90 py-4 md:py-6 lg:py-10 px-2 md:px-6 lg:px-12 w-full rounded-lg">
          <DataStateContainer
            isLoading={isLoading}
            isError={isError}
            data={rfq}
            errorComponent={<NetworkErrorUI />}
            loadingComponent={
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              </div>
            }
            emptyComponent={<div>RFQ not found</div>}
          >
            <PurchaseOrderForm mode="create-from-rfq" rfqId={rfqId!} rfqData={rfqData} />
          </DataStateContainer>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderFromRFQ;

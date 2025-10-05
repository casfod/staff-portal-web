import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { RootState } from "../../store/store";
import { usePurchaseOrder } from "./Hooks/usePurchaseOrder";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import Spinner from "../../ui/Spinner";
import { DataStateContainer } from "../../ui/DataStateContainer";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import FormEditPurchaseOrder from "./FormEditPurchaseOrder";

const EditPurchaseOrder = () => {
  const navigate = useNavigate();
  const { purchaseOrderId } = useParams();

  // Data fetching
  const {
    data: remoteData,
    isLoading,
    isError,
  } = usePurchaseOrder(purchaseOrderId!);

  const purchaseOrder = useSelector(
    (state: RootState) => state.purchaseOrder.purchaseOrder
  );

  // Redirect logic
  useEffect(() => {
    if (!purchaseOrderId || (!isLoading && !remoteData && !purchaseOrder)) {
      navigate("/procurement/purchase-orders");
    }
  }, [remoteData, purchaseOrder, purchaseOrderId, navigate, isLoading]);

  const requestData = remoteData?.data || purchaseOrder;

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Edit Purchase Order</TextHeader>
          <Button onClick={() => navigate("/procurement/purchase-orders")}>
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
        emptyComponent={<div>Purchase Order not found</div>}
      >
        <div className="border w-full rounded-lg">
          <div className="bg-white bg-opacity-90 py-4 md:py-6 lg:py-10 px-2 md:px-6 lg:px-12 w-full rounded-lg">
            <FormEditPurchaseOrder purchaseOrder={requestData} />
          </div>
        </div>
      </DataStateContainer>
    </div>
  );
};

export default EditPurchaseOrder;

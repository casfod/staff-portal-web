import { List } from "lucide-react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate, useParams } from "react-router-dom";
import FormEditPaymentRequest from "./FormEditPaymentRequest";
import Button from "../../ui/Button";
import TextHeader from "../../ui/TextHeader";

const EditPaymentRequest = () => {
  const navigate = useNavigate();

  const param = useParams();

  // Access the purchaseRequest state from Redux

  const paymentRequest = useSelector(
    (state: RootState) => state.paymentRequest.paymentRequest
  );

  useEffect(() => {
    if (!param || !paymentRequest) {
      navigate("/purchase-requests");
    }
  }, [paymentRequest, param, navigate]);

  // Handle the case where paymentRequest is null
  if (!paymentRequest) {
    return <div>No purchase request data available.</div>;
  }

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Update Payment Request</TextHeader>

          <Button
            onClick={() => navigate(-1)} // Use relative path here
          >
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="border w-full rounded-lg">
        <div className="bg-white bg-opacity-90 py-4 md:py-6 py-10 px-2 md:px-6 px-12 w-full rounded-lg">
          <FormEditPaymentRequest paymentRequest={paymentRequest!} />
        </div>
      </div>
    </div>
  );
};

export default EditPaymentRequest;

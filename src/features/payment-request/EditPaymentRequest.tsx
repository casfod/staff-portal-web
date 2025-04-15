import { List } from "lucide-react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate, useParams } from "react-router-dom";
import FormEditPaymentRequest from "./FormEditPaymentRequest";

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
    <div className="flex flex-col items-center gap-6 pb-80">
      <div className="w-full flex justify-between items-center">
        <h1
          className="text-2xl font-semibold text-gray-700"
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          Update Payment Request
        </h1>
        <button
          onClick={() => navigate(-1)} // Use relative path here
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover "
        >
          <List className="h-4 w-4 mr-2" />
          All Requests
        </button>
      </div>

      <div className="border w-full rounded-lg">
        <div className="bg-white bg-opacity-90 py-10 px-12 w-full rounded-lg">
          <FormEditPaymentRequest paymentRequest={paymentRequest!} />
        </div>
      </div>
    </div>
  );
};

export default EditPaymentRequest;

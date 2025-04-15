import { useNavigate, useParams } from "react-router-dom";
import FormEditRequest from "./FormEditRequest";
import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useEffect } from "react";

const EditRequest = () => {
  const navigate = useNavigate();

  const param = useParams();

  // Access the purchaseRequest state from Redux

  const purchaseRequest = useSelector(
    (state: RootState) => state.purchaseRequest.purchaseRequest
  );

  useEffect(() => {
    if (!param || !purchaseRequest) {
      navigate("/purchase-requests");
    }
  }, [purchaseRequest, param, navigate]);

  // Handle the case where purchaseRequest is null
  if (!purchaseRequest) {
    return <div>No purchase request data available.</div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 pb-80">
      <div className="w-full flex justify-between items-center">
        <h1
          className="text-2xl font-semibold text-gray-700"
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          Update Purchase Request
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
          <FormEditRequest purchaseRequest={purchaseRequest} />
        </div>
      </div>
    </div>
  );
};

export default EditRequest;

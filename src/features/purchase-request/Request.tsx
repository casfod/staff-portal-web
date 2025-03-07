import { List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PurchaseRequesForm from "./PurchaseRequesForm";

const Request = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full flex justify-between items-center">
        <h1
          className="text-2xl font-semibold text-gray-700"
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          New Purchase Request
        </h1>
        <button
          onClick={() => navigate(-1)} // Use relative path here
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <List className="h-4 w-4 mr-2" />
          All Requests
        </button>
      </div>

      <div className="border w-full rounded-lg">
        <div className="bg-white bg-opacity-90 py-10 px-12 w-full rounded-lg">
          <PurchaseRequesForm />
        </div>
      </div>
    </div>
  );
};

export default Request;

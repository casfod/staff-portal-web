import { List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FormAddTravelRequest from "./FormAddTravelRequest";
import Button from "../../ui/Button";

const CreateTravelRequest = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-6 pt-4 pb-80">
      <div className="w-full flex justify-between items-center">
        <h1
          className=" md:text-lg lg:text-2xl font-semibold text-gray-700"
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          New Travel Request
        </h1>
        <Button
          onClick={() => navigate(-1)} // Use relative path here
        >
          <List className="h-4 w-4 mr-1 md:mr-2" />
          List
        </Button>
      </div>

      <div className="border w-full rounded-lg">
        <div className="bg-white bg-opacity-90 py-4 md:py-6 py-10 px-2 md:px-6 px-12 w-full rounded-lg">
          <FormAddTravelRequest />
        </div>
      </div>
    </div>
  );
};

export default CreateTravelRequest;

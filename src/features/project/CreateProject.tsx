import { List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FormAddProject from "./FormAddProject";

const CreateProject = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-6 pb-80">
      <div className="w-full flex justify-between items-center">
        <h1
          className="text-2xl font-semibold text-gray-700"
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          New Project
        </h1>
        <button
          onClick={() => navigate(-1)} // Use relative path here
          className="inline-flex items-center px-4 py-2 border border-transparent 
text-xs 2xl:text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover "
        >
          <List className="h-4 w-4 mr-2" />
          All Projects
        </button>
      </div>

      <div className="border w-full rounded-lg">
        <div className="bg-white bg-opacity-90 py-10 px-12 w-full rounded-lg">
          <FormAddProject />
        </div>
      </div>
    </div>
  );
};

export default CreateProject;

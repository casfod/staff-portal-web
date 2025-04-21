import { useNavigate, useParams } from "react-router-dom";
import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useEffect } from "react";
import FormEditProject from "./FormEditProject";
import Button from "../../ui/Button";
import TextHeader from "../../ui/TextHeader";

const EditProject = () => {
  const navigate = useNavigate();
  const param = useParams();

  // Access the purchaseRequest state from Redux
  const project = useSelector((state: RootState) => state.project?.project);

  // Redirect if no project or params are available
  useEffect(() => {
    if (!param || !project) {
      navigate("/projects");
    }
  }, [project, param, navigate]);

  // Handle the case where purchaseRequest is null
  if (!project) {
    return <div>No project data available.</div>;
  }

  return (
    <div className="flex flex-col space-y-4 pb-16">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 md:pb-4 space-y-4 shadow-sm ">
        <div className="flex justify-between items-center">
          <TextHeader>Update Project</TextHeader>

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
          <FormEditProject project={project} />
        </div>
      </div>
    </div>
  );
};

export default EditProject;

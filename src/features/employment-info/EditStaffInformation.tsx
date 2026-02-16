import { useNavigate, useParams } from "react-router-dom";
import { Info } from "lucide-react";
import Button from "../../ui/Button";
import TextHeader from "../../ui/TextHeader";
import StaffInformationForm from "./StaffInformationForm";
import { localStorageUser } from "../../utils/localStorageUser";
import { useUserById } from "../user/Hooks/useUsers";
import Spinner from "../../ui/Spinner";
import NetworkErrorUI from "../../ui/NetworkErrorUI";

const EditStaffInformation = () => {
  const navigate = useNavigate();
  const params = useParams();
  const currentUser = localStorageUser();

  // If userId param exists, edit that user, otherwise edit current user
  const staffId = params.userId || currentUser?.id;

  const {
    data: userData,
    isLoading: isLoadingUser,
    isError,
    error,
  } = useUserById(staffId!);

  if (isLoadingUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <NetworkErrorUI error={error} />;
  }

  if (!userData?.data) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No user data available</p>
      </div>
    );
  }

  const user = userData.data;
  const isEditingSelf = !params.userId || params.userId === currentUser?.id;
  const isSuperAdmin = currentUser?.role === "SUPER-ADMIN";

  // Check if user has permission to edit
  const canEdit = isSuperAdmin || isEditingSelf;

  if (!canEdit) {
    return (
      <div className="flex flex-col space-y-3 pb-80">
        <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
          <TextHeader>Access Denied</TextHeader>
        </div>
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-red-600">
            You don't have permission to edit this user's information.
          </p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>
            {isEditingSelf
              ? "Update My Information"
              : `Update ${user.first_name} ${user.last_name}'s Information`}
          </TextHeader>

          <Button onClick={() => navigate(-1)} variant="secondary" size="small">
            <Info className="h-4 w-4 mr-1 md:mr-2" />
            Cancel
          </Button>
        </div>
        {isSuperAdmin && !isEditingSelf && (
          <p className="text-xs text-blue-600 mt-1">
            ⚡ Editing as Super Administrator
          </p>
        )}
      </div>

      <div className="border w-full rounded-lg">
        <div className="bg-white bg-opacity-90 py-4 md:py-6 lg:py-10 px-2 md:px-6 lg:px-12 w-full rounded-lg">
          <StaffInformationForm
            staffInfo={user}
            onClose={() => navigate(-1)}
            isAdminView={!isEditingSelf} // Admin view if editing another user
          />
        </div>
      </div>
    </div>
  );
};

export default EditStaffInformation;

import { List } from "lucide-react";

import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { dateformat } from "../../utils/dateFormat";
import { localStorageUser } from "../../utils/localStorageUser";
import Button from "../../ui/Button";
import { useUpdateStatus } from "./Hooks/useUpdateStatus";
import StatusBadge from "../../ui/StatusBadge";
import { ConceptNoteDetails } from "./ConceptNoteDetails";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import StatusUpdateForm from "../../ui/StatusUpdateForm";
import TextHeader from "../../ui/TextHeader";
import { FileUpload } from "../../ui/FileUpload";
import { useUpdateConceptNote } from "./Hooks/useUpdateConceptNote";
import { ConceptNoteType } from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
// import { truncateText } from "../../utils/truncateText";
import { useStatusUpdate } from "../../hooks/useStatusUpdate";
import { useConceptNote } from "./Hooks/useConceptNote";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import Spinner from "../../ui/Spinner";

const ConceptNote = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { requestId } = useParams();

  // Data fetching and reconciliation
  const { data: remoteData, isLoading, isError } = useConceptNote(requestId!);

  const conceptNote = useSelector(
    (state: RootState) => state.conceptNote.conceptNote
  );

  const requestData = useMemo(
    () => remoteData?.data || conceptNote,
    [remoteData, conceptNote]
  );

  // Redirect logic - PLACE IT HERE
  useEffect(() => {
    if (!requestId || (!isLoading && !requestData)) {
      navigate("/purchase-requests");
    }
  }, [requestData, requestId, navigate, isLoading]);

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData] = useState<Partial<ConceptNoteType>>({});

  // Custom hooks
  const { handleStatusChange } = useStatusUpdate();

  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    requestId!
  );

  const { updateConceptNote, isPending: isUpdating } = useUpdateConceptNote(
    conceptNote?.id!
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    updateConceptNote({ data: formData, files: selectedFiles });
  };

  const onStatusChangeHandler = () => {
    handleStatusChange(status, comment, async (data) => {
      try {
        await updateStatus(data, {
          onError: (error) => {
            // This will be caught by the handleStatusChange's try/catch
            throw error;
          },
        });
      } catch (error) {
        // Re-throw to ensure the promise chain is maintained
        throw error;
      }
    });
  };

  if (isError) return <NetworkErrorUI />;
  if (!requestData) {
    return <div>No project data available.</div>;
  }

  const requestStatus = requestData.status;

  const showStatusUpdate =
    requestData.status === "pending" &&
    currentUser.id === requestData.approvedBy?.id;

  // const tableHeadData = ["Prepared By", "Status", "Account Code", "Date"];
  const tableHeadData = ["Prepared By", "Status", "Date"];

  const tableRowData = [
    `${requestData.preparedBy.first_name} ${requestData.preparedBy.last_name}`,
    <StatusBadge status={requestData.status!} key="status-badge" />,
    // truncateText(requestData.account_Code, 25),
    dateformat(requestData.createdAt!),
  ];

  const isCreator = requestData!.preparedBy!.id === currentUser.id;
  const canUploadFiles = isCreator && requestStatus === "approved";

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Concept Note</TextHeader>

          <Button onClick={() => navigate("/concept-notes")}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      {isLoading ? (
        <div className="flex justify-center w-full h-full">
          <Spinner />
        </div>
      ) : (
        <div className="w-full bg-inherit shadow-sm rounded-lg  border pb-[200px] overflow-x-scroll">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 ">
              <tr>
                {tableHeadData.map((title, index) => (
                  <th
                    key={index}
                    className="px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium   uppercase text-xs 2xl:text-text-sm tracking-wider"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              <tr
                key={requestData.id}
                className="h-[40px] max-h-[40px] hover:cursor-pointer hover:bg-[#f2f2f2]"
              >
                {tableRowData.map((data, index) => (
                  <td
                    key={index}
                    className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium   uppercase text-sm 2xl:text-text-base tracking-wider"
                  >
                    {data}
                  </td>
                ))}
              </tr>

              <tr>
                <td colSpan={4}>
                  <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                    <ConceptNoteDetails request={requestData} />

                    {canUploadFiles && (
                      <div className="flex flex-col gap-3 mt-3">
                        <FileUpload
                          selectedFiles={selectedFiles}
                          setSelectedFiles={setSelectedFiles}
                          accept=".jpg,.png,.pdf,.xlsx,.docx"
                          multiple={true}
                        />

                        {selectedFiles.length > 0 && (
                          <div className="self-center">
                            <Button disabled={isUpdating} onClick={handleSend}>
                              {isUpdating ? <SpinnerMini /> : "Upload"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {requestData.status !== "draft" && (
                      <div className="  mt-4 tracking-wide">
                        <RequestCommentsAndActions request={requestData} />

                        {showStatusUpdate && (
                          <StatusUpdateForm
                            requestStatus={requestData.status!}
                            status={status}
                            setStatus={setStatus}
                            comment={comment}
                            setComment={setComment}
                            isUpdatingStatus={isUpdatingStatus}
                            handleStatusChange={onStatusChangeHandler}
                            directApproval={true}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConceptNote;

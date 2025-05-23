import { List } from "lucide-react";

import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { dateformat } from "../../utils/dateFormat";
import { localStorageUser } from "../../utils/localStorageUser";
import Swal from "sweetalert2";
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
import { truncateText } from "../../utils/truncateText";

const ConceptNote = () => {
  const localStorageUserX = localStorageUser();

  const conceptNote = useSelector(
    (state: RootState) => state.conceptNote.conceptNote
  );
  const navigate = useNavigate();
  const param = useParams();

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData] = useState<Partial<ConceptNoteType>>({});

  useEffect(() => {
    if (!param || !conceptNote) {
      navigate("/concept-notes");
    }
  }, [conceptNote, param, navigate]);

  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    param.requestId!
  );

  const { updateConceptNote, isPending: isUpdating } = useUpdateConceptNote(
    conceptNote?.id!
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    updateConceptNote({ data: formData, files: selectedFiles });
  };

  const handleStatusChange = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to change this request status?",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: "Yes, update it!",
      customClass: { popup: "custom-style" },
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(
          { status, comment },
          {
            onError: (error) => {
              Swal.fire("Error!", error.message, "error");
            },
          }
        );
      }
    });
  };

  if (!conceptNote) {
    return <div>No project data available.</div>;
  }

  const showStatusUpdate =
    conceptNote.status === "pending" &&
    localStorageUserX.id === conceptNote.approvedBy?.id;

  const tableHeadData = ["Prepared By", "Status", "Account Code", "Date"];

  const tableRowData = [
    `${conceptNote.preparedBy.first_name} ${conceptNote.preparedBy.last_name}`,
    <StatusBadge status={conceptNote.status!} key="status-badge" />,
    truncateText(conceptNote.account_Code, 40),
    dateformat(conceptNote.createdAt!),
  ];

  const isCreator = conceptNote!.preparedBy!.id === localStorageUserX.id;
  const isFile = selectedFiles.length > 0;

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Concept Note</TextHeader>

          <Button onClick={() => navigate(-1)}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            All Projects
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="w-full bg-inherit shadow-sm rounded-lg  border pb-[200px] overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 ">
            <tr>
              {tableHeadData.map((title, index) => (
                <th
                  key={index}
                  className="px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            <tr
              key={conceptNote.id}
              className="h-[40px] max-h-[40px] hover:cursor-pointer hover:bg-[#f2f2f2]"
            >
              {tableRowData.map((data, index) => (
                <td
                  key={index}
                  className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium text-gray-600 uppercase text-sm 2xl:text-text-base tracking-wider"
                >
                  {data}
                </td>
              ))}
            </tr>

            <tr>
              <td colSpan={4}>
                <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                  <ConceptNoteDetails request={conceptNote} />

                  {isCreator && conceptNote.status === "approved" && (
                    <div className="flex flex-col gap-3 mt-3">
                      <FileUpload
                        selectedFiles={selectedFiles}
                        setSelectedFiles={setSelectedFiles}
                        accept=".jpg,.png,.pdf,.xlsx,.docx"
                        multiple={true}
                      />

                      {isFile && (
                        <div className="self-center">
                          <Button disabled={isUpdating} onClick={handleSend}>
                            {isUpdating ? <SpinnerMini /> : "Upload"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {conceptNote.status !== "draft" && (
                    <div className="text-gray-600 mt-4 tracking-wide">
                      <RequestCommentsAndActions request={conceptNote} />

                      {showStatusUpdate && (
                        <StatusUpdateForm
                          requestStatus={conceptNote.status!}
                          status={status}
                          setStatus={setStatus}
                          comment={comment}
                          setComment={setComment}
                          isUpdatingStatus={isUpdatingStatus}
                          handleStatusChange={handleStatusChange}
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
    </div>
  );
};

export default ConceptNote;

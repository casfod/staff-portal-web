import { SlMagnifier } from "react-icons/sl";
// import { TravelRequestType } from "../interfaces";

const RequestCommentsAndActions = ({
  request,
  handleAction,
}: {
  request: any;
  handleAction?: (request: any) => void;
}) => {
  if (!request.reviewedBy || request.status === "draft") return null;

  return (
    <div
      className="flex flex-col gap-4 mt-4 text-gray-700 text-sm"
      style={{ letterSpacing: "1px" }}
    >
      <div className="flex flex-col gap-2">
        <p>
          <span className="font-bold mr-1 uppercase">Reviewed By:</span>
          {`${request.reviewedBy.first_name} ${request.reviewedBy.last_name}`}
        </p>
        {request.approvedBy && (
          <p>
            <span className="font-bold mr-1 uppercase">Approval:</span>
            {`${request.approvedBy.first_name} ${request.approvedBy.last_name}`}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-bold uppercase">Comments:</span>
        <div className="w-fit flex flex-col gap-2">
          {request.comments?.map((comment: any, index: any) => (
            <div
              key={index}
              className="border-2 px-4 py-2 rounded-lg shadow-lg bg-white"
            >
              <p className="text-base font-extrabold">
                {`${comment.user.role}: ${comment.user.first_name} ${comment.user.last_name}`}
              </p>
              <p className="text-sm">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>

      {handleAction && (
        <button
          onClick={() => handleAction(request)}
          className="self-center inline-flex items-center w-fit px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover mt-3"
        >
          <SlMagnifier className="mr-1" />
          <span>Inspect</span>
        </button>
      )}
    </div>
  );
};

export default RequestCommentsAndActions;

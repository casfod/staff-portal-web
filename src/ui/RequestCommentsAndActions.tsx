import { SlMagnifier } from "react-icons/sl";

const RequestCommentsAndActions = ({
  request,
  handleAction,
}: {
  request: any;
  handleAction?: (request: any) => void;
}) => {
  if (request.status === "draft") return null;

  // Determine if the request was reviewed or went straight to approval
  const wasReviewed = request.reviewedBy ? true : false;
  const wasApproved = request.approvedBy ? true : false;

  return (
    <div
      className="flex flex-col gap-4 mt-4 text-gray-700 text-sm"
      style={{ letterSpacing: "1px" }}
    >
      {/* Show approval chain */}
      <div className="flex flex-col gap-2">
        {wasReviewed && (
          <p>
            <span className="font-bold mr-1 uppercase">Reviewed By:</span>
            {`${request.reviewedBy.first_name} ${request.reviewedBy.last_name}`}
          </p>
        )}
        {wasApproved && (
          <p>
            <span className="font-bold mr-1 uppercase">
              {wasReviewed ? "Approved By:" : "Directly Approved By:"}
            </span>
            {`${request.approvedBy.first_name} ${request.approvedBy.last_name}`}
          </p>
        )}
      </div>

      {/* Show comments if they exist */}
      {request.comments?.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-bold uppercase">Comments:</span>
          <div className="w-fit flex flex-col gap-2">
            {request.comments.map((comment: any, index: number) => (
              <div
                key={index}
                className="w-full max-w-md md:max-w-full border-2 px-4 py-2 rounded-lg shadow-lg bg-white mb-4"
              >
                <p className="text-base font-extrabold">
                  {`${comment.user.role}: ${comment.user.first_name} ${comment.user.last_name}`}
                </p>
                <p className="text-sm">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action button if provided */}
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

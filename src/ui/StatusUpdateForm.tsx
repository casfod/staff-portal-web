import Button from "./Button";
import SpinnerMini from "./SpinnerMini";

const StatusUpdateForm = ({
  requestStatus,
  status,
  setStatus,
  comment,
  setComment,
  isUpdatingStatus,
  handleStatusChange,
}: {
  requestStatus: string;
  status: string;
  setStatus: (value: string) => void;
  comment: string;
  setComment: (value: string) => void;
  isUpdatingStatus: boolean;
  handleStatusChange: () => void;
}) => {
  return (
    <form className="flex flex-col w-full gap-3 tracking-wide">
      <div className="flex flex-col w-full gap-2">
        <label htmlFor="content">
          <span className="font-bold uppercase">Comment</span>{" "}
          <em>(Optional)</em>
        </label>
        <textarea
          id="content"
          className="border-2 w-full p-2 min-h-40 text-base rounded-lg shadow-sm focus:outline-none"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          aria-label="Enter your comment"
        />
      </div>

      <div className="w-fit border border-gray-700 rounded-md">
        <select
          className="text-xs md:text-sm bg-inherit px-3 py-2 rounded-md"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isUpdatingStatus}
        >
          <option value="">ACTIONS</option>
          {requestStatus === "pending" && (
            <option value="reviewed">APPROVE REVIEW</option>
          )}
          {requestStatus === "reviewed" && (
            <option value="approved">APPROVE REQUEST</option>
          )}
          <option value="rejected">REJECT</option>
        </select>
      </div>

      {status && (
        <div className="flex w-full justify-center p-4">
          <Button size="medium" onClick={handleStatusChange}>
            {isUpdatingStatus ? <SpinnerMini /> : "Update Status"}
          </Button>
        </div>
      )}
    </form>
  );
};

export default StatusUpdateForm;

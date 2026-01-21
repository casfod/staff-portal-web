import Button from "./Button";
import SpinnerMini from "./SpinnerMini";
import { FormEvent } from "react";

interface StatusUpdateFormProps {
  requestStatus: string;
  status: string;
  setStatus: (value: string) => void;
  comment: string;
  setComment: (value: string) => void;
  isUpdatingStatus: boolean;
  handleStatusChange: () => void;
  statusOptions?: Array<{ value: string; label: string }>;
  isFinanceReviewer?: boolean;
  isProcurementReviewer?: boolean;
  isApprover?: boolean;
}

const StatusUpdateForm = ({
  requestStatus,
  status,
  setStatus,
  comment,
  setComment,
  isUpdatingStatus,
  handleStatusChange,
  statusOptions,
  isFinanceReviewer = false,
  isProcurementReviewer = false,
  isApprover = false,
}: StatusUpdateFormProps) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleStatusChange();
  };

  // Determine default status options if none provided
  // In StatusUpdateForm.tsx, update the get default status options logic:

  const defaultStatusOptions =
    statusOptions ||
    (() => {
      const options = [];

      if (isFinanceReviewer) {
        options.push(
          { value: "approved", label: "Approve Finance Review" },
          { value: "rejected", label: "Reject Finance Review" }
        );
      } else if (isProcurementReviewer) {
        options.push(
          {
            value: "approved",
            label: "Approve Procurement Review",
          },
          { value: "rejected", label: "Reject Procurement Review" }
        );
      } else if (isApprover) {
        options.push(
          { value: "approved", label: "Approve Request" },
          { value: "rejected", label: "Reject Request" }
        );
      } else {
        // Fallback for backward compatibility - should not happen in purchase requests
        if (requestStatus === "pending") {
          options.push({ value: "reviewed", label: "Approve Review" });
        }
        if (requestStatus === "reviewed") {
          options.push({ value: "approved", label: "Approve Request" });
        }
        options.push({ value: "rejected", label: "Reject" });
      }

      return options;
    })();

  const displayOptions = statusOptions || defaultStatusOptions;

  return (
    <form
      className="flex flex-col w-full gap-3 tracking-wide"
      onSubmit={handleSubmit}
    >
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

      <div className="w-fit max-w-md md:max-w-fit border border-gray-700 rounded-md">
        <select
          className="text-xs md:text-sm bg-inherit px-3 py-2 rounded-md w-full"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isUpdatingStatus}
        >
          <option value="">ACTIONS</option>
          {displayOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {status && (
        <div className="flex w-full justify-center p-4">
          <Button type="submit" size="medium" disabled={isUpdatingStatus}>
            {isUpdatingStatus ? <SpinnerMini /> : "Update Status"}
          </Button>
        </div>
      )}
    </form>
  );
};

export default StatusUpdateForm;

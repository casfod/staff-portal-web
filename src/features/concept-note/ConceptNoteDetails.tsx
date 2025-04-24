// import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import { ConceptNote } from "../../interfaces";
import { useParams } from "react-router-dom";
import { dateformat } from "../../utils/dateFormat";

interface RequestDetailsProps {
  request: ConceptNote;
}

export const ConceptNoteDetails = ({ request }: RequestDetailsProps) => {
  const param = useParams();

  const isInspect = param.requestId!;

  return (
    <div
      className={`border border-gray-300 px-6 py-4 rounded-lg shadow-sm ${
        !isInspect && "bg-[#F8F8F8]"
      }`}
    >
      <div
        className="flex flex-col gap-2 md:gap-3 w-full text-gray-600 text-sm mb-3 break-words"
        style={{ letterSpacing: "1px" }}
      >
        <p className="text-sm text-gray-600">
          <span className="font-extrabold uppercase">Project Code:</span>{" "}
          {request.project_code}
        </p>
        <div className="text-sm text-gray-600">
          <h2 className="font-extrabold uppercase mb-1">Activity Title:</h2>{" "}
          <p>{request.activity_title}</p>
        </div>

        <div className="text-sm text-gray-600 whitespace-pre-line">
          <h2 className="font-extrabold uppercase mb-1">Objectives Purpose:</h2>{" "}
          <p> {request.objectives_purpose}</p>
        </div>
        <div className="text-sm text-gray-600 whitespace-pre-line">
          <h2 className="font-extrabold uppercase mb-1">Background Context:</h2>{" "}
          <p>{request.background_context}</p>
        </div>

        <div className="text-sm text-gray-600 whitespace-pre-line">
          <h2 className="font-extrabold uppercase mb-1">
            Benefits Of Project:
          </h2>{" "}
          <p>{request.benefits_of_project}</p>
        </div>

        <div className="text-sm text-gray-600 whitespace-pre-line">
          <h2 className="font-extrabold uppercase mb-1">Strategic Plan:</h2>{" "}
          <p>{request.strategic_plan}</p>
        </div>
        <div className="text-sm text-gray-600 whitespace-pre-line">
          <h2 className="font-extrabold uppercase mb-1">Activity Location:</h2>{" "}
          <p>{request.activity_location}</p>
        </div>

        <div className="text-sm text-gray-600 whitespace-pre-line">
          <h2 className="font-extrabold uppercase mb-1">
            Detailed Activity Description:
          </h2>{" "}
          <p>{request.detailed_activity_description}</p>
        </div>
        <div className="text-sm text-gray-600 whitespace-pre-line">
          <h2 className="font-extrabold uppercase mb-1">Activity Period:</h2>{" "}
          <p className="text-sm text-gray-600">
            <span>{dateformat(request.activity_period.from)}</span> -{" "}
            <span>{dateformat(request.activity_period.to)}</span>
          </p>
        </div>
        <div className="text-sm text-gray-600 whitespace-pre-line">
          <h2 className="font-extrabold uppercase mb-1">
            Means of verification:
          </h2>{" "}
          <p>{request.means_of_verification}</p>
        </div>

        <p className="text-sm text-gray-600">
          <span className="font-extrabold uppercase">Budget:</span>{" "}
          {moneyFormat(Number(request.activity_budget), "NGN")}
        </p>
      </div>

      <div className="w-fit  mt-4">
        <p className="text-sm text-gray-600">
          <span className="font-bold mr-1 uppercase">Prepared By :</span>
          {`${request?.preparedBy?.first_name} ${request?.preparedBy?.last_name}`}
        </p>

        <p className="text-sm text-gray-600">
          <span className="font-bold mr-1 uppercase">Role :</span>
          {request?.preparedBy.role}
        </p>
      </div>
    </div>
  );
};

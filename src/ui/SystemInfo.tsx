import { Calendar } from "lucide-react";
4;
import { formatToDDMMYYYY } from "../utils/formatToDDMMYYYY";
import Row from "./Row";

interface RequestDetailsProps {
  request: any;
}

const SystemInfo = ({ request }: RequestDetailsProps) => {
  const systemInfo = {
    title: "System Information",
    icon: <Calendar className="w-4 h-4" />,
    fields: [
      {
        id: "createdAt",
        label: "Created",
        content: formatToDDMMYYYY(request?.createdAt!),
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        id: "updatedAt",
        label: "Last Updated",
        content: formatToDDMMYYYY(request?.updatedAt!),
        icon: <Calendar className="w-4 h-4" />,
      },
    ],
  };

  return (
    <div className="bg-gray-50/60 rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">{systemInfo.icon}</div>
        <h3 className="text-lg font-semibold text-gray-800">
          {systemInfo.title}
        </h3>
      </div>

      <Row cols="grid-cols-1 md:grid-cols-3">
        <div className="space-y-4">
          {systemInfo.fields.map((field) => (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-2 min-w-[180px]">
                <div className="text-gray-500">{field.icon}</div>
                <span className="text-sm font-medium text-gray-600">
                  {field.label}
                </span>
              </div>

              <div className="sm:ml-auto">
                <span className="text-sm font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md">
                  {field.content}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Row>
    </div>
  );
};

export default SystemInfo;

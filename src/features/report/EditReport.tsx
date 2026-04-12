// ============================================================
// EditReport.tsx
// ============================================================
// (place in a separate file: EditReport.tsx)

import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import FormEditReport from "./FormEditReport";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import { List } from "lucide-react";
import { useEffect } from "react";

export const EditReport = () => {
  const navigate = useNavigate();
  const param = useParams();

  const report = useSelector((state: RootState) => state.report.report);

  useEffect(() => {
    if (!param || !report) {
      navigate("/reporting");
    }
  }, [report, param, navigate]);

  if (!report) {
    return <div>No report data available.</div>;
  }

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Update Report</TextHeader>
          <Button onClick={() => navigate(-1)}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="border w-full rounded-lg">
        <div className="bg-white bg-opacity-90 py-4 md:py-6 lg:py-10 px-2 md:px-6 lg:px-12 w-full rounded-lg">
          <FormEditReport report={report} />
        </div>
      </div>
    </div>
  );
};

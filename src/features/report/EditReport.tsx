// src/features/report/EditReport.tsx
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../store/store';
import { useEffect } from 'react';
import ReportForm from './ReportForm';
import TextHeader from '../../components/custom/TextHeader';
import { Button } from '../../components/ui/button';
import { List } from 'lucide-react';
import { useReport } from './Hooks/useReport';
import { DataStateContainer } from '../../components/custom/DataStateContainer';
import Spinner from '../../components/custom/Spinner';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';

const EditReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: remoteData, isLoading, isError } = useReport(id!);
  const localReport = useSelector((state: RootState) => state.report.report);

  useEffect(() => {
    if (!id || (!isLoading && !remoteData && !localReport)) {
      navigate('/reporting');
    }
  }, [remoteData, localReport, id, navigate, isLoading]);

  const reportData = remoteData?.data || localReport;

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Update Report</TextHeader>
          <Button variant="outline" size="sm" onClick={() => navigate('/reporting')}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <DataStateContainer
        isLoading={isLoading}
        isError={isError}
        data={reportData}
        errorComponent={<NetworkErrorUI />}
        loadingComponent={<Spinner />}
        emptyComponent={<div>Report not found</div>}
      >
        <div className="border w-full rounded-lg">
          <div className="bg-white bg-opacity-90 py-4 md:py-6 lg:py-10 px-2 md:px-6 lg:px-12 w-full rounded-lg">
            <ReportForm mode="edit" initialData={reportData} />
          </div>
        </div>
      </DataStateContainer>
    </div>
  );
};

export default EditReport;
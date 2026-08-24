// src/features/leave/Leave.tsx
import { List } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

// Components
import TextHeader from '../../components/custom/TextHeader';
import { Button } from '../../components/ui/button';
import { LeaveDetails } from './LeaveDetails';
import { truncateText } from '../../utils/truncateText';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import ActionIcons from '../../components/custom/ActionIcons';
import StatusBadge from '../../components/custom/StatusBadge';
import StatusUpdateForm from '../../components/custom/StatusUpdateForm';
import Spinner from '../../components/custom/Spinner';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import { DataStateContainer } from '../../components/custom/DataStateContainer';

// Hooks
import { useLeave, useUpdateLeaveStatus } from './Hooks/useLeave';
import { localStorageUser } from '../../utils/localStorageUser';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { getUserFullName } from '@/utils/userHelpers';
import LeaveCard from './LeaveCard';
import { infoConfig } from '@/config/config-info';

const Leave = () => {
  const navigate = useNavigate();
  const { leaveId } = useParams();
  const currentUser = localStorageUser();

  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');

  // Fetch leave data
  const { data: remoteData, isLoading, isError } = useLeave(leaveId!);
  const leaveFromStore = useSelector((state: RootState) => state.leave.leave);
  
  const leave = remoteData?.data || leaveFromStore;

  // Redirect logic
  useEffect(() => {
    if (!leaveId || (!isLoading && !leave)) {
      navigate('/human-resources/leave');
    }
  }, [leave, leaveId, navigate, isLoading]);

  const { updateStatus, isPending: isUpdatingStatus } = useUpdateLeaveStatus(leaveId!);

  // PDF logic
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating } = usePdfDownload({
    filename: `${infoConfig.abbriviation}-Leave-${leave?.leaveNumber || leave?.id}`,
    multiPage: true,
    titleOptions: {
      text: `${infoConfig.abbriviation} Leave Application : ${leave?.leaveNumber || ''}`,
    },
    footerCode: {
      label: `${infoConfig.abbriviation} Leave`,
      value: leave?.leaveNumber ?? '',
    },
  });

  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };

  const handleStatusChange = () => {
    if (!status) return;

    updateStatus(
      { status, comment },
      {
        onSuccess: () => {
          setStatus('');
          setComment('');
        },
      }
    );
  };

  // Check if user can approve (must be the assigned approver and leave is pending)
  const canApprove = leave?.status === 'pending' && leave?.approvedBy?.id === currentUser?.id;
  const tableHeadData = ['Staff Name', 'Status', 'Leave Type', 'Date', 'Actions'];

  const tableRowData = [
    {
      id: 'staffName',
      content: truncateText(getUserFullName(leave?.createdBy) || 'N/A', 30),
    },
    {
      id: 'status',
      content: <StatusBadge status={leave?.status || 'N/A'} />,
    },
    { id: 'leaveType', content: leave?.leaveType || 'N/A' },
    {
      id: 'date',
      content: formatToDDMMYYYY(leave?.createdAt || new Date().toISOString()),
    },
    {
      id: 'action',
      content: (
        <ActionIcons
          isGeneratingPDF={isGenerating}
          onDownloadPDF={handleDownloadPDF}
          hideInspect={true}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Leave</TextHeader>
          <Button variant="outline" size="sm" onClick={() => navigate('/human-resources/leave')}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <DataStateContainer
        isLoading={isLoading}
        isError={isError}
        data={leave}
        errorComponent={<NetworkErrorUI />}
        loadingComponent={<Spinner />}
        emptyComponent={<div>No leave data available.</div>}
      >
        {/* Main Table Section */}
        <div ref={pdfContentRef}>
          <div className="w-full bg-inherit shadow-sm rounded-lg border pb-[200px] overflow-x-scroll">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className='hidden sm:table-row'>
                  {tableHeadData.map((title, index) => (
                    <th
                      key={index}
                      className="px-3 py-2.5 md:px-6 md:py-3 text-left font-medium uppercase text-xs 2xl:text-text-sm tracking-wider"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {/* Desktop Row */}
                <tr className="hidden sm:table-row" key={leave?.id}>
                  {tableRowData.map(data => (
                    <td
                      key={data.id}
                      className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium text-sm 2xl:text-text-base tracking-wider"
                    >
                      {data.content}
                    </td>
                  ))}
                </tr>

                {/* Mobile Card View */}
                <tr className="sm:hidden">
                  <td colSpan={tableHeadData.length} className="p-4 border-b border-gray-200">
                    {leave && (
                      <LeaveCard
                        leave={leave}
                        actionIconsProps={{
                          isGeneratingPDF: isGenerating,
                          onDownloadPDF: handleDownloadPDF,
                          hideInspect: true,
                        }}
                        context="detail"
                      />
                    )}
                  </td>
                </tr>

                <tr>
                  <td colSpan={5}>
                    <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                      <LeaveDetails request={leave!} />

                      {/* Status Update Form for Approver */}
                      {canApprove && (
                        <div className="mt-4">
                          <StatusUpdateForm
                            requestStatus={leave?.status}
                            status={status}
                            setStatus={setStatus}
                            comment={comment}
                            setComment={setComment}
                            isUpdatingStatus={isUpdatingStatus}
                            handleStatusChange={handleStatusChange}
                            statusOptions={[
                              { value: 'approved', label: 'Approve Leave' },
                              { value: 'rejected', label: 'Reject Leave' },
                            ]}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </DataStateContainer>
    </div>
  );
};

export default Leave;
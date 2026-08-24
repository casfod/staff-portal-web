// Project.tsx - Optimized
import { List, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { moneyFormat } from '../../utils/moneyFormat';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { truncateText } from '../../utils/truncateText';
import { usePdfDownload } from '../../hooks/usePdfDownload';

// Radix UI Components
import { Button } from '../../components/ui/button';

// Custom Components
import TextHeader from '../../components/custom/TextHeader';
import ActionIcons from '../../components/custom/ActionIcons';
import { ProjectDetails } from './ProjectDetails';

const Project = () => {
  const navigate = useNavigate();
  const param = useParams();
  const project = useSelector((state: RootState) => state.project?.project);

  useEffect(() => {
    if (!project || !param) {
      navigate('/projects');
    }
  }, [project, param, navigate]);

  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating } = usePdfDownload({
    filename: `Project-${project?.id}`,
    multiPage: true,
  });

  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };

  if (!project) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const tableHeadData = ['Project Code', 'Budget', 'Date', 'Actions'];
  const requestCreatedAt = project.createdAt ?? '';

  const tableRowData = [
    { id: 'projectCode', content: truncateText(project.projectCode, 40) },
    {
      id: 'projectBudget',
      content: moneyFormat(Number(project.projectBudget), 'USD'),
    },
    { id: 'date', content: formatToDDMMYYYY(requestCreatedAt) },
    {
      id: 'action',
      content: <ActionIcons isGeneratingPDF={isGenerating} onDownloadPDF={handleDownloadPDF} />,
    },
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Project</TextHeader>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      <div ref={pdfContentRef}>
        <div className="w-full bg-white shadow-sm rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {tableHeadData.map((title, index) => (
                    <th
                      key={index}
                      className="px-3 py-2.5 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  {tableRowData.map(data => (
                    <td key={data.id} className="px-3 py-2.5 md:px-6 md:py-3 text-sm">
                      {data.content}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td colSpan={4} className="px-3 py-4 md:px-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <ProjectDetails request={project} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;

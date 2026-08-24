// ProjectDetails.tsx - Optimized with Milestones
import { moneyFormat } from '../../utils/moneyFormat';
import { IProject } from '../../interfaces';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import FileAttachmentContainer from '../../components/custom/FileAttachmentContainer';
import { localStorageUser } from '../../utils/localStorageUser';
import { Dot, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import DetailContainer from '../../components/custom/DetailContainer';
import { Badge } from '../../components/ui/badge';

interface RequestDetailsProps {
  request: IProject;
}

const SectorsTable = ({ sectors }: { sectors: IProject['sectors'] }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 rounded-md mb-4">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Sector
          </th>
          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Percentage
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {sectors!.map((sector, index) => (
          <tr key={index}>
            <td className="px-6 py-4 text-sm">{sector.name}</td>
            <td className="px-6 py-4 text-sm">
              <Badge variant="secondary" className="font-medium">
                {sector.percentage}%
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Milestones Component
const MilestonesList = ({ milestones }: { milestones: IProject['milestones'] }) => {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No milestones have been added to this project.
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'active':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {milestones.map((milestone, index) => (
        <div
          key={index}
          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex-shrink-0 mt-1">{getStatusIcon(milestone.status || 'pending')}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-semibold text-gray-900">{milestone.title}</h4>
              <Badge variant={getStatusBadgeVariant(milestone.status || 'pending')}>
                {milestone.status || 'pending'}
              </Badge>
            </div>
            {milestone.description && (
              <p className="mt-1 text-sm text-gray-600">{milestone.description}</p>
            )}
            <div className="mt-2 text-xs text-gray-400">Milestone #{index + 1}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ProjectDetails = ({ request }: RequestDetailsProps) => {
  const projectData = [
    { id: 'projectCode', label: 'Project Code', content: request.projectCode },
    { id: 'projectTitle', label: 'Project Name', content: request.projectTitle },
    { id: 'donor', label: 'Donor', content: request.donor, isBlock: true },
    {
      id: 'project_objectives',
      label: 'Objectives',
      content: request.projectObjectives,
      isBlock: true,
    },
    {
      id: 'target_beneficiaries',
      label: 'Target Beneficiaries',
      content: request.targetBeneficiaries.join(', '),
      isBlock: true,
    },
    {
      id: 'project_locations',
      label: 'Project Locations',
      content: request.projectLocations.join(', '),
      isBlock: true,
    },
    {
      id: 'Budget',
      label: 'Budget',
      content: moneyFormat(Number(request.projectBudget), 'USD'),
      isBlock: true,
    },
    {
      id: 'accountCode',
      label: 'Account Codes',
      content: request?.accountCodes.map((account, index) => (
        <div key={index} className="flex items-center">
          <Dot className="h-4 w-4 flex-shrink-0" />
          <span>{account.name}</span>
        </div>
      )),
      isBlock: true,
    },
    {
      id: 'project_partners',
      label: 'Partners',
      content: request.projectPartners.join(', '),
      isBlock: true,
    },
    {
      id: 'implementation_period',
      label: 'Implementation Period',
      content: `${formatToDDMMYYYY(
        request.implementationPeriod.from
      )} - ${formatToDDMMYYYY(request.implementationPeriod.to)}`,
      isBlock: true,
    },
    {
      id: 'project_summary',
      label: 'Project Summary',
      content: request.projectSummary,
      isBlock: true,
    },
    {
      id: 'status',
      label: 'Status',
      content: (
        <Badge
          variant={
            request.status === 'completed'
              ? 'success'
              : request.status === 'cancelled'
                ? 'destructive'
                : 'default'
          }
          className="capitalize"
        >
          {request.status || 'Ongoing'}
        </Badge>
      ),
      isBlock: false,
    },
  ];

  return (
    <DetailContainer>
      <div className="flex flex-col gap-3 w-full text-sm mb-3 break-words">
        {projectData.map(item => (
          <div key={item.id} className={item.isBlock ? 'whitespace-pre-line' : ''}>
            <h2 className="text-sm font-bold uppercase mb-1">{item.label}:</h2>
            <div>{item.content}</div>
          </div>
        ))}
      </div>

      <h2 className="text-center text-base md:text-lg font-semibold tracking-widest my-4">
        SECTORS
      </h2>

      <SectorsTable sectors={request.sectors} />

      <h2 className="text-center text-base md:text-lg font-semibold tracking-widest my-4">
        MILESTONES
      </h2>

      <MilestonesList milestones={request.milestones} />

      {/* ✅ FIXED: Use modelName instead of model */}
      <FileAttachmentContainer
        modelName="Project"
        id={request.id}
        status={request.status}
        canManage={localStorageUser()?.role === 'SUPER-ADMIN'}
      />
    </DetailContainer>
  );
};

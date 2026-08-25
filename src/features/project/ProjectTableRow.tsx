// ProjectTableRow.tsx - Refactored with BaseTableRow
import { IProject, TableHeaderConfig } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { moneyFormat } from '../../utils/moneyFormat';
import { truncateText } from '../../utils/truncateText';

// Custom Components
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import ActionIcons from '../../components/custom/ActionIcons';
import { ProjectDetails } from './ProjectDetails';
import RequestCommentsAndActions from '../../components/custom/RequestActions';
import ProjectCard from './ProjectCard';

interface ProjectTableRowProps {
  project: IProject;
  handleEdit: (project: IProject) => void;
  handleAction: (project: IProject) => void;
  handleDelete?: (id: string) => void;
  tableHeadData?: TableHeaderConfig[];
}

const ProjectTableRow = ({
  project,
  handleEdit,
  handleAction,
  handleDelete,
}: ProjectTableRowProps) => {
  const currentUser = localStorageUser();
  const isEditable = currentUser.role === 'SUPER-ADMIN';
  const requestId = project.id ?? '';
  const requestCreatedAt = project.createdAt ?? '';

  const rowData = [
    {
      id: 'name',
      content: truncateText(project.projectCode, 40),
      showOnMobile: true,
    },
    {
      id: 'status',
      content: (
        <span
          className={`capitalize text-xs px-2 py-1 rounded-full ${
            project.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : project.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
          }`}
        >
          {project.status || 'ongoing'}
        </span>
      ),
      showOnMobile: true,
    },
    {
      id: 'budget',
      content: moneyFormat(Number(project.projectBudget), 'USD'),
      showOnMobile: true,
    },
    {
      id: 'date',
      content: formatToDDMMYYYY(requestCreatedAt),
      showOnMobile: false,
      showOnTablet: true,
    },
    {
      id: 'actions',
      content: (
        <ActionIcons
          isEditable={isEditable}
          requestId={requestId}
          onEdit={() => handleEdit(project)}
          onDelete={handleDelete}
          request={project}
        />
      ),
      showOnMobile: true,
    },
  ];

  const expandedContent = (
    <>
      <ProjectDetails request={project} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={project} handleAction={handleAction} />
      </div>
    </>
  );

  // Mobile card for small screens
  const mobileCard = (
    <ProjectCard
      project={project}
      requestId={requestId} // ← Add this if needed
      actionIconsProps={{
        isEditable,
        requestId,
        onEdit: handleEdit,
        onDelete: handleDelete,
        request: project, // ← Make sure request is passed
        variant: 'list',
      }}
      context="list"
      className="sm:hidden"
    />
  );

  return (
    <BaseTableRow
      id={requestId}
      rowData={rowData}
      expandedContent={expandedContent}
      mobileCard={mobileCard}
      isExpandable={true}
    />
  );
};

export default ProjectTableRow;

// ProjectCard.tsx - Card for IProject
import BaseRequestCard, { RequestCardWrapperProps } from '../../components/custom/BaseRequestCard';
import { IProject } from '../../interfaces';

interface ProjectCardProps extends RequestCardWrapperProps {
  project: IProject;
}

const ProjectCard = ({ project, requestId, actionIconsProps, ...rest }: ProjectCardProps) => (
  <BaseRequestCard
    displayName={project.projectTitle}
    identifier={project.projectCode}
    status={project.status}
    date={project.createdAt}
    totalAmount={project.projectBudget}
    actionIconsProps={actionIconsProps}
    requestId={requestId ?? project.id}
    {...rest}
  />
);

export default ProjectCard;

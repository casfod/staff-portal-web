// src/features/projects/FormEditProject.tsx
import { useMemo } from 'react';
import { IProject } from '../../interfaces';
import { useProjectForm } from './Hooks/useProjectForm';
import { useUpdateProject } from './Hooks/useProjects';
import ProjectFormFields from './ProjectFormFields';

interface FormEditProjectProps {
  project: IProject;
}

const FormEditProject: React.FC<FormEditProjectProps> = ({ project }) => {
  const {
    formData,
    selectedFiles,
    setSelectedFiles,
    handleFormChange,
    handleNestedChange,
    handleSectorChange,
    handleAccountCodeChange,
    addSector,
    removeSector,
    addAccountCode,
    removeAccountCode,
    addMilestone, // ✅ Add this
    removeMilestone, // ✅ Add this
    updateMilestone, // ✅ Add this
  } = useProjectForm(project);

  const { updateProject, isPending } = useUpdateProject(project.id!);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProject({ data: { ...formData } });
  };

  // Memoize callbacks to prevent unnecessary re-renders
  const memoizedHandlers = useMemo(
    () => ({
      handleFormChange,
      handleNestedChange,
      handleSectorChange,
      handleAccountCodeChange,
      addSector,
      removeSector,
      addAccountCode,
      removeAccountCode,
      addMilestone, // ✅ Add this
      removeMilestone, // ✅ Add this
      updateMilestone, // ✅ Add this
    }),
    [
      handleFormChange,
      handleNestedChange,
      handleSectorChange,
      handleAccountCodeChange,
      addSector,
      removeSector,
      addAccountCode,
      removeAccountCode,
      addMilestone, // ✅ Add this
      removeMilestone, // ✅ Add this
      updateMilestone, // ✅ Add this
    ]
  );

  return (
    <ProjectFormFields
      formData={formData}
      selectedFiles={selectedFiles}
      setSelectedFiles={setSelectedFiles}
      {...memoizedHandlers}
      onSubmit={handleSubmit}
      isPending={isPending}
      submitLabel="Update"
      submitSize="md"
      existingFiles={project.files}
    />
  );
};

export default FormEditProject;

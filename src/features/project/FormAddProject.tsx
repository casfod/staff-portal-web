// src/features/projects/FormAddProject.tsx
import { useMemo } from 'react';
import { useProjectForm } from './Hooks/useProjectForm';
import { useAddProject } from './Hooks/useProjects';
import ProjectFormFields from './ProjectFormFields';

const FormAddProject = () => {
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
  } = useProjectForm();

  const { addProject, isPending } = useAddProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with data:', { formData });
    addProject({ data: { ...formData }, files: selectedFiles });
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
      submitLabel="Submit"
      submitSize="md"
    />
  );
};

export default FormAddProject;

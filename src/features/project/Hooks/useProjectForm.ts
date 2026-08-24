// src/features/projects/Hooks/useProjectForm.ts
import { useState } from 'react';
import { IMilestone, IProject } from '../../../interfaces';

const emptyProject: IProject = {
  projectTitle: '',
  donor: '',
  projectPartners: [],
  projectCode: '',
  implementationPeriod: { from: undefined, to: '' },
  accountCodes: [],
  projectBudget: 0,
  sectors: [],
  projectLocations: [],
  targetBeneficiaries: [],
  projectObjectives: '',
  projectSummary: '',
  status: 'ongoing',
  milestones: [], // ✅ Ensure this is always an array
} as unknown as IProject;

/**
 * Holds all form state + handlers shared by FormAddProject and
 * FormEditProject. Pass an existing project to pre-fill (edit mode),
 * or omit it to start from an empty project (create mode).
 */
export function useProjectForm(initialProject?: IProject) {
  const [formData, setFormData] = useState<IProject>(
    initialProject
      ? {
          ...initialProject,
          projectPartners: [...(initialProject.projectPartners || [])],
          accountCodes: [...(initialProject.accountCodes || [])],
          sectors: [...(initialProject.sectors || [])],
          projectLocations: [...(initialProject.projectLocations || [])],
          targetBeneficiaries: [...(initialProject.targetBeneficiaries || [])],
          implementationPeriod: { ...initialProject.implementationPeriod },
          milestones: [...(initialProject.milestones || [])], // ✅ Ensure array
        }
      : emptyProject
  );

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFormChange = (field: keyof IProject, value: string | string[] | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (
    parentField: keyof IProject,
    field: string,
    value: Date | string | number | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as object),
        [field]: value instanceof Date ? value.toISOString() : value,
      },
    }));
  };

  const handleSectorChange = (
    index: number,
    field: keyof IProject['sectors'][0],
    value: string | number
  ) => {
    setFormData(prev => {
      const updatedSectors = [...prev.sectors];
      updatedSectors[index] = { ...updatedSectors[index], [field]: value as never };
      return { ...prev, sectors: updatedSectors };
    });
  };

  const handleAccountCodeChange = (
    index: number,
    field: keyof IProject['accountCodes'][0],
    value: string
  ) => {
    setFormData(prev => {
      const updatedAccountCodes = [...prev.accountCodes];
      updatedAccountCodes[index] = { ...updatedAccountCodes[index], [field]: value };
      return { ...prev, accountCodes: updatedAccountCodes };
    });
  };

  const addSector = () => {
    setFormData(prev => ({
      ...prev,
      sectors: [...prev.sectors, { name: 'Education', percentage: 0 } as IProject['sectors'][0]],
    }));
  };

  const removeSector = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors.filter((_, i) => i !== index),
    }));
  };

  const addAccountCode = () => {
    setFormData(prev => ({
      ...prev,
      accountCodes: [...prev.accountCodes, { name: '' }],
    }));
  };

  const removeAccountCode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      accountCodes: prev.accountCodes.filter((_, i) => i !== index),
    }));
  };

  // ✅ FIXED: Handle undefined milestones
  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), { title: '', description: '', status: 'pending' }],
    }));
  };

  // ✅ FIXED: Handle undefined milestones
  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: (prev.milestones || []).filter((_, i) => i !== index),
    }));
  };

  // ✅ FIXED: Handle undefined milestones
  const updateMilestone = (index: number, field: keyof IMilestone, value: string) => {
    setFormData(prev => {
      const updatedMilestones = [...(prev.milestones || [])];
      updatedMilestones[index] = { ...updatedMilestones[index], [field]: value };
      return { ...prev, milestones: updatedMilestones };
    });
  };

  return {
    formData,
    setFormData,
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
    addMilestone, // ✅ Added
    removeMilestone, // ✅ Added
    updateMilestone, // ✅ Added
  };
}

// src/features/employment-info/StaffInformationForm/useStaffInformationForm.ts
import { useState, useEffect, useMemo } from 'react';
import { IEmploymentInfo, IUser } from '../../../interfaces';
import { localStorageUser } from '../../../utils/localStorageUser';
import {
  useMyEmploymentInfo,
  useUpdateMyEmploymentInfo,
  useSuperAdminUpdateEmploymentInfo,
} from '../Hooks/useEmploymentInfo';
import { useUsers } from '../../user/Hooks/useUsers';
import { SectionCompletion, FormErrors } from './types';
import { lgaByState } from '../../../assets/nigerianData';

const EMPTY_FORM: IEmploymentInfo = {
  isProfileComplete: false,
  isEmploymentInfoLocked: false,
  personalDetails: {
    fullName: '',
    stateOfOrigin: '',
    lga: '',
    religion: '',
    address: '',
    homePhone: '',
    cellPhone: '',
    emailAddress: '',
    ninNumber: '',
    birthDate: undefined,
    maritalStatus: undefined,
    spouseName: '',
    spouseAddress: '',
    spousePhone: '',
    numberOfChildren: 0,
  },
  jobDetails: {
    title: '',
    idNo: '',
    staffTaxIdNo: '',
    workLocation: '',
    workEmail: '',
    workPhone: '',
    workCellPhone: '',
    startDate: undefined,
    endDate: undefined,
    supervisor: undefined,
  },
  emergencyContact: {
    fullName: '',
    address: '',
    primaryPhone: '',
    cellPhone: '',
    relationship: '',
  },
  bankDetails: {
    bankName: '',
    accountName: '',
    bankSortCode: '',
    accountNumber: '',
  },
};

export const useStaffInformationForm = (
  staffInfo: IUser | undefined,
  isAdminView: boolean,
  onClose?: () => void
) => {
  const currentUser = localStorageUser();
  const isSuperAdmin = currentUser?.role === 'SUPER-ADMIN';

  const { data, isLoading: isLoadingSelfData } = useMyEmploymentInfo();
  const { updateEmploymentInfo, isPending: isUpdatingSelf } = useUpdateMyEmploymentInfo();
  const { superAdminUpdate, isPending: isUpdatingAdmin } = useSuperAdminUpdateEmploymentInfo();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 1000 });

  const users = useMemo(() => usersData?.data ?? [], [usersData]);
  const isPending = isUpdatingSelf || isUpdatingAdmin;
  const canUpdate = isAdminView ? isSuperAdmin : data?.data?.canUpdate !== false;

  const [formData, setFormData] = useState<IEmploymentInfo>(() => {
    if (staffInfo?.employmentInfo) {
      // Find the supervisor name from users list if supervisor exists
      let supervisorName = staffInfo.employmentInfo.jobDetails?.supervisor || '';

      if (staffInfo.employmentInfo.jobDetails?.supervisor && !supervisorName) {
        const supervisor = users.find(
          u => u.id === staffInfo.employmentInfo?.jobDetails?.supervisor
        );
        if (supervisor) {
          supervisorName = `${supervisor.firstName} ${supervisor.lastName}`;
        }
      }

      return {
        ...EMPTY_FORM,
        ...staffInfo.employmentInfo,
        personalDetails: {
          ...EMPTY_FORM.personalDetails,
          ...staffInfo.employmentInfo.personalDetails,
          fullName:
            staffInfo.employmentInfo.personalDetails?.fullName ||
            `${staffInfo.firstName} ${staffInfo.lastName}`,
        },
        jobDetails: {
          ...EMPTY_FORM.jobDetails,
          ...staffInfo.employmentInfo.jobDetails,
          title: staffInfo.employmentInfo.jobDetails?.title || staffInfo.position || '',
          supervisor: staffInfo.employmentInfo.jobDetails?.supervisor || undefined,
        },
        emergencyContact: {
          ...EMPTY_FORM.emergencyContact,
          ...staffInfo.employmentInfo.emergencyContact,
        },
        bankDetails: {
          ...EMPTY_FORM.bankDetails,
          ...staffInfo.employmentInfo.bankDetails,
        },
      };
    }

    if (staffInfo) {
      return {
        ...EMPTY_FORM,
        personalDetails: {
          ...EMPTY_FORM.personalDetails,
          fullName: `${staffInfo.firstName} ${staffInfo.lastName}`,
        },
        jobDetails: {
          ...EMPTY_FORM.jobDetails,
          title: staffInfo.position || '',
        },
      };
    }

    return EMPTY_FORM;
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [completedSections, setCompletedSections] = useState<SectionCompletion>({
    personal: false,
    job: false,
    emergency: false,
    bank: false,
  });

  // Load existing data for self-service mode
  useEffect(() => {
    if (isAdminView || !data?.data?.employmentInfo) return;

    const existingData = data.data.employmentInfo;
    let supervisorName = existingData.jobDetails?.supervisor || '';
    if (existingData.jobDetails?.supervisor && !supervisorName) {
      const supervisor = users.find(u => u.id === existingData.jobDetails?.supervisor);
      if (supervisor) {
        supervisorName = `${supervisor.firstName} ${supervisor.lastName}`;
      }
    }

    setFormData(prev => ({
      ...prev,
      ...existingData,
      personalDetails: {
        ...prev.personalDetails,
        ...existingData.personalDetails,
      },
      jobDetails: {
        ...prev.jobDetails,
        ...existingData.jobDetails,
        supervisor: existingData.jobDetails?.supervisor || undefined,
      },
      emergencyContact: {
        ...prev.emergencyContact,
        ...existingData.emergencyContact,
      },
      bankDetails: {
        ...prev.bankDetails,
        ...existingData.bankDetails,
      },
    }));
  }, [data, isAdminView, users]);

  // Check section completion
  useEffect(() => {
    const personalComplete = !!(
      formData.personalDetails?.fullName &&
      formData.personalDetails?.cellPhone &&
      formData.personalDetails?.address &&
      formData.personalDetails?.ninNumber
    );

    const jobComplete = !!(formData.jobDetails?.title && formData.jobDetails?.startDate);

    const emergencyComplete = !!(
      formData.emergencyContact?.fullName &&
      formData.emergencyContact?.primaryPhone &&
      formData.emergencyContact?.address &&
      formData.emergencyContact?.relationship
    );

    const bankComplete = !!(
      formData.bankDetails?.bankName &&
      formData.bankDetails?.accountName &&
      formData.bankDetails?.accountNumber &&
      formData.bankDetails?.accountNumber.length === 10
    );

    setCompletedSections({
      personal: personalComplete,
      job: jobComplete,
      emergency: emergencyComplete,
      bank: bankComplete,
    });
  }, [formData]);

  const handleFormChange = (
    section: keyof IEmploymentInfo,
    field: string,
    value: string | number | Date | null | undefined
  ) => {
    // Clear error for this field
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }

    if (section === 'personalDetails' && field === 'stateOfOrigin') {
      setFormData(prev => ({
        ...prev,
        personalDetails: {
          ...(prev.personalDetails || EMPTY_FORM.personalDetails),
          [field]: value as string | undefined,
          lga: '',
        },
      }));
    } else {
      setFormData(prev => {
        const currentSection = prev[section];
        const baseObject =
          currentSection && typeof currentSection === 'object' ? currentSection : {};

        return {
          ...prev,
          [section]: {
            ...baseObject,
            [field]: value,
          },
        };
      });
    }
  };

  const handleDateChange = (section: keyof IEmploymentInfo, field: string, date: Date | null) => {
    handleFormChange(section, field, date);
  };

  const handleSupervisorChange = (selectedId: string) => {
    if (selectedId) {
      const selectedUser = userOptions.find(u => u.id === selectedId);
      if (selectedUser) {
        handleFormChange('jobDetails', 'supervisor', selectedUser.name);
        handleFormChange('jobDetails', 'supervisor', selectedId);
      }
    } else {
      handleFormChange('jobDetails', 'supervisor', '');
      handleFormChange('jobDetails', 'supervisor', undefined);
    }
  };

  const updateAvatarUrl = (avatarUrl: string) => {
    // Update the staffInfo object if we have access to it
    if (staffInfo) {
      staffInfo.avatar = { url: avatarUrl, publicId: '' };
    }
    // You might also want to update the form data or trigger a refetch
  };

  const updateSignatureUrl = (signatureUrl: string) => {
    // Update the staffInfo object if we have access to it
    if (staffInfo) {
      staffInfo.signature = { url: signatureUrl, publicId: '' };
    }
    // Note: mutating staffInfo here doesn't itself trigger a re-render.
    // Callers should also keep their own local state (see index.tsx) so the
    // UI updates immediately rather than piggybacking on an unrelated
    // setState elsewhere in the tree.
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.personalDetails?.fullName) {
      newErrors['personalDetails.fullName'] = 'Full name is required';
    }
    if (!formData.personalDetails?.cellPhone) {
      newErrors['personalDetails.cellPhone'] = 'Cell phone is required';
    } else if (!/^[0-9]{11}$/.test(formData.personalDetails.cellPhone)) {
      newErrors['personalDetails.cellPhone'] = 'Enter a valid 11-digit phone number';
    }
    if (!formData.personalDetails?.address) {
      newErrors['personalDetails.address'] = 'Address is required';
    }
    if (!formData.personalDetails?.ninNumber) {
      newErrors['personalDetails.ninNumber'] = 'NIN number is required';
    } else if (!/^[0-9]{11}$/.test(formData.personalDetails.ninNumber)) {
      newErrors['personalDetails.ninNumber'] = 'NIN must be 11 digits';
    }

    if (!formData.jobDetails?.title) {
      newErrors['jobDetails.title'] = 'Job title is required';
    }
    if (!formData.jobDetails?.startDate) {
      newErrors['jobDetails.startDate'] = 'Start date is required';
    }

    if (!formData.emergencyContact?.fullName) {
      newErrors['emergencyContact.fullName'] = 'Emergency contact name is required';
    }
    if (!formData.emergencyContact?.primaryPhone) {
      newErrors['emergencyContact.primaryPhone'] = 'Primary phone is required';
    } else if (!/^[0-9]{11}$/.test(formData.emergencyContact.primaryPhone)) {
      newErrors['emergencyContact.primaryPhone'] = 'Enter a valid 11-digit phone number';
    }
    if (!formData.emergencyContact?.address) {
      newErrors['emergencyContact.address'] = 'Emergency contact address is required';
    }
    if (!formData.emergencyContact?.relationship) {
      newErrors['emergencyContact.relationship'] = 'Relationship is required';
    }

    if (!formData.bankDetails?.bankName) {
      newErrors['bankDetails.bankName'] = 'Bank name is required';
    }
    if (!formData.bankDetails?.accountName) {
      newErrors['bankDetails.accountName'] = 'Account name is required';
    }
    if (!formData.bankDetails?.accountNumber) {
      newErrors['bankDetails.accountNumber'] = 'Account number is required';
    } else if (!/^[0-9]{10}$/.test(formData.bankDetails.accountNumber)) {
      newErrors['bankDetails.accountNumber'] = 'Account number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = document.querySelector('.border-red-500');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (isAdminView && staffInfo?.id && isSuperAdmin) {
      superAdminUpdate({ userId: staffInfo.id, data: formData }, { onSuccess: () => onClose?.() });
    } else {
      updateEmploymentInfo(formData, { onSuccess: () => onClose?.() });
    }
  };

  const getLgaOptions = () => {
    const selectedState = formData.personalDetails?.stateOfOrigin;
    if (selectedState && lgaByState[selectedState]) {
      return lgaByState[selectedState].map((lga: string) => ({
        id: lga,
        name: lga,
      }));
    }
    return [];
  };

  const userOptions = useMemo(() => {
    return users
      .filter(user => user.id)
      .map(user => ({
        id: user.id as string,
        name: `${user.firstName} ${user.lastName}`,
      }));
  }, [users]);

  const getSelectedsupervisor = () => {
    const currentSupervisorName = formData.jobDetails?.supervisor;
    const currentsupervisor = formData.jobDetails?.supervisor;

    if (currentsupervisor) {
      return currentsupervisor;
    }

    if (currentSupervisorName) {
      const user = users.find(u => `${u.firstName} ${u.lastName}` === currentSupervisorName);
      return user?.id || '';
    }

    return '';
  };

  const completionPercentage = Math.round(
    (Object.values(completedSections).filter(v => v).length / 4) * 100
  );

  return {
    formData,
    errors,
    completedSections,
    completionPercentage,
    isPending,
    isLoadingSelfData,
    isLoadingUsers,
    canUpdate,
    isSuperAdmin,
    users,
    userOptions,
    getLgaOptions,
    getSelectedsupervisor,
    handleFormChange,
    handleDateChange,
    handleSupervisorChange,
    handleSubmit,
    setErrors,
    updateAvatarUrl,
    updateSignatureUrl,
  };
};
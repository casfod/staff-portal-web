// src/features/employment-info/StaffInformationForm/index.tsx
import React, { useState } from 'react';
import { AlertCircle, Camera, Loader2 } from 'lucide-react';
import SpinnerMini from '../../../components/custom/SpinnerMini';
import { useStaffInformationForm } from './useStaffInformationForm';
import { PersonalDetailsSection } from './PersonalDetailsSection';
import { JobDetailsSection } from './JobDetailsSection';
import { EmergencyContactSection } from './EmergencyContactSection';
import { BankDetailsSection } from './BankDetailsSection';
import { FormProgressBar } from './FormProgressBar';
import { FormActions } from './FormActions';
import { StaffInformationFormProps } from './types';
import { useAvatar } from '../../../hooks/useFile';
import { IAvatarResponse } from '../../../interfaces';
import { SignatureUpload } from '../../../components/custom/SignatureUpload';
import { localStorageUser } from '@/utils/localStorageUser';
import { infoConfig } from '@/config/config-info';

const StaffInformationForm: React.FC<StaffInformationFormProps> = ({
  onClose,
  staffInfo,
  isAdminView = false,
}) => {
  const {
    formData,
    errors,
    completedSections,
    completionPercentage,
    isPending,
    isLoadingSelfData,
    isLoadingUsers,
    canUpdate,
    userOptions,
    getLgaOptions,
    getSelectedsupervisor,
    handleFormChange,
    handleDateChange,
    handleSupervisorChange,
    handleSubmit,
    updateAvatarUrl,
    updateSignatureUrl,
  } = useStaffInformationForm(staffInfo, isAdminView, onClose);

  const currentUser = localStorageUser();
  const { uploadAvatar, isUploading } = useAvatar(currentUser.id);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Held locally (rather than relying purely on the staffInfo mutation in
  // updateSignatureUrl) so the "current signature" preview swaps
  // immediately after a save, without depending on an unrelated re-render.
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>(
    staffInfo?.signature?.url
  );

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setAvatarError('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be less than 5MB');
      return;
    }

    setAvatarError(null);
    try {
      const result: IAvatarResponse = await uploadAvatar(file);
      const avatarUrl = result?.data?.url || '';
      if (avatarUrl) {
        updateAvatarUrl(avatarUrl);
      }
    } catch (_error) {
      setAvatarError('Failed to upload avatar');
    }
    e.target.value = ''; // Reset input
  };

  const handleSignatureUploaded = (url: string) => {
    setSignatureUrl(url || undefined);
    updateSignatureUrl(url);
  };

  const avatarUrl = staffInfo?.avatar?.url || infoConfig.profilePlaceHolder;

  if (!isAdminView && isLoadingSelfData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <SpinnerMini />
          <p className="text-gray-500 mt-2">Loading your information...</p>
        </div>
      </div>
    );
  }

  if (!canUpdate) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-amber-800 mb-2">Updates Currently Disabled</h3>
        <p className="text-amber-700">
          {isAdminView
            ? "You don't have permission to update this user's information."
            : 'Employment information updates are currently disabled. Please contact your administrator if you need to make changes.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      {/* Avatar Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Profile Photo</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-3 border-gray-200 shadow-md"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">
                Click the camera icon to upload a profile photo
              </p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF • Max 5MB</p>
              {avatarError && <p className="text-sm text-red-600 mt-2">{avatarError}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <SignatureUpload
        userId={currentUser.id}
        currentSignatureUrl={signatureUrl}
        onUploaded={handleSignatureUploaded}
      />

      <PersonalDetailsSection
        formData={formData}
        errors={errors}
        getLgaOptions={getLgaOptions}
        onFormChange={handleFormChange}
        onDateChange={handleDateChange}
        isCompleted={completedSections.personal}
      />

      <JobDetailsSection
        formData={formData}
        errors={errors}
        isLoadingUsers={isLoadingUsers}
        userOptions={userOptions}
        getSelectedsupervisor={getSelectedsupervisor}
        handleSupervisorChange={handleSupervisorChange}
        onFormChange={handleFormChange}
        onDateChange={handleDateChange}
        isCompleted={completedSections.job}
      />

      <EmergencyContactSection
        formData={formData}
        errors={errors}
        onFormChange={handleFormChange}
        isCompleted={completedSections.emergency}
      />

      <BankDetailsSection
        formData={formData}
        errors={errors}
        onFormChange={handleFormChange}
        isCompleted={completedSections.bank}
      />

      <FormProgressBar
        completionPercentage={completionPercentage}
        completedSections={completedSections}
      />

      <FormActions onClose={onClose} isPending={isPending} />
    </form>
  );
};

export default StaffInformationForm;
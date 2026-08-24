// src/features/employment-info/StaffInformationForm/constants.ts
import { bankNames } from '../../../assets/Banks';
import { nigerianStates, nigerianReligions } from '../../../assets/nigerianData';

export const maritalStatusOptions = [
  { id: 'Single', name: 'Single' },
  { id: 'Married', name: 'Married' },
  { id: 'Divorced', name: 'Divorced' },
  { id: 'Widowed', name: 'Widowed' },
];

export const relationshipOptions = [
  { id: 'Spouse', name: 'Spouse' },
  { id: 'Parent', name: 'Parent' },
  { id: 'Sibling', name: 'Sibling' },
  { id: 'Child', name: 'Child' },
  { id: 'Friend', name: 'Friend' },
  { id: 'Other', name: 'Other' },
];

export const bankOptions = bankNames.map(bank => ({
  id: bank.name,
  name: bank.name,
}));

export const nigeriaStateOptions = nigerianStates.map(state => ({
  id: state,
  name: state,
}));

export const religionOptions = nigerianReligions.map(religion => ({
  id: religion,
  name: religion,
}));

export const SECTION_CONFIG = [
  { key: 'personal' as const, label: 'Personal', icon: 'User' },
  { key: 'job' as const, label: 'Job', icon: 'Briefcase' },
  { key: 'emergency' as const, label: 'Emergency', icon: 'Phone' },
  { key: 'bank' as const, label: 'Bank', icon: 'Banknote' },
] as const;

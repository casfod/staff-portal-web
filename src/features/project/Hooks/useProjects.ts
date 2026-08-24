import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { IProjectsListResponse, IProjectStatsResponse } from '../../../interfaces';
import { getProjects, getProjectsStats } from '../../../services/apiProject';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addProject as savePurchaseRequestsApi } from '../../../services/apiProject.ts';
import { updateProject as updateProjectApi } from '../../../services/apiProject.ts';
import { AxiosError, AxiosResponse } from 'axios';
import { IProject } from '../../../interfaces.ts';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface ErrorResponse {
  message: string;
}

interface HookError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useProjects(
  queryParams: Record<string, string | number | undefined>,
  options?: UseQueryOptions<IProjectsListResponse, Error> // Add options parameter
) {
  return useQuery<IProjectsListResponse, Error>({
    queryKey: ['projects', queryParams],
    queryFn: () => getProjects(queryParams),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

export function useAddProject() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: addProject,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ data }: { data: Partial<IProject>; files: File[] }) =>
      savePurchaseRequestsApi(data),

    onSuccess: data => {
      if (data.statusCode === 201) {
        // Show success toast
        toast.success('Project created successfully');

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        navigate(-1);
      } else {
        // Handle unexpected response
        toast.error(data.message);
      }
    },

    onError: (err: HookError) => {
      // Show error toast
      toast.error(err.response?.data.message || 'An error occurred');

      // Log the error for debugging
      console.error('Error creating Project:', err.response?.data.message);
    },
  });

  return { addProject, isPending, isError };
}

export function useProjectStats(
  options?: UseQueryOptions<IProjectStatsResponse, Error> // Add options parameter
) {
  return useQuery<IProjectStatsResponse, Error>({
    queryKey: ['projects-stats'],
    queryFn: () => getProjectsStats(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

export function useUpdateProject(projectId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    mutate: updateProject,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ data }: { data: Partial<IProject> }) => updateProjectApi(projectId, data),

    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Project updated successfully');

        navigate(-1);
      } else if (data.statusCode !== 200) {
        toast.error('Project update not successful');
        setErrorMessage(data.message);
        console.error('Login Error:', data.message); // Log error directly here
      }
    },

    onError: (err: HookError) => {
      toast.error('Error updating Project');
      const error = err.response?.data.message || 'An error occurred';

      console.error('Project update Error:', error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updateProject, isPending, isError, errorMessage };
}

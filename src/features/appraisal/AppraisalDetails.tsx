// src/features/appraisal/AppraisalDetails.tsx
import React from 'react';
import { IAppraisal, IUser, PerformanceRating } from '../../interfaces';
import { useParams, useNavigate } from 'react-router-dom';
import FileAttachmentContainer from '../../components/custom/FileAttachmentContainer';
import DetailContainer from '../../components/custom/DetailContainer';
import { Button } from '../../components/ui/button';
import { Edit } from 'lucide-react';

// Type for employee rating - can be string or object
type EmployeeRating = PerformanceRating | { rating: string; achievements: string } | null;

interface AppraisalDetailsProps {
  request: IAppraisal;
  canEditStaffSections?: boolean;
  canEditSupervisorSections?: boolean;
  isStaff?: boolean;
  isSupervisor?: boolean;
  isAdmin?: boolean;
}

export const AppraisalDetails = ({
  request,
  canEditStaffSections,
  canEditSupervisorSections,
  isStaff,
  isSupervisor,
  isAdmin,
}: AppraisalDetailsProps) => {
  const { appraisalId } = useParams();
  const navigate = useNavigate();

  /**
   * Supports both data shapes:
   *   Old: employeeRating = "Achieved" | "Partly Achieved" | "Not Achieved" | ""
   *   New: employeeRating = { rating: "...", achievements: "..." }
   */
  const getEmployeeRating = (employeeRating: EmployeeRating): string => {
    if (!employeeRating) return '';
    if (typeof employeeRating === 'string') return employeeRating;
    return employeeRating.rating ?? '';
  };

  const getEmployeeAchievements = (employeeRating: EmployeeRating): string => {
    if (!employeeRating) return '';
    if (typeof employeeRating === 'object') {
      return employeeRating.achievements ?? '';
    }
    return ''; // old structure had no per-objective achievements
  };

  const getRatingStyle = (rating: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      Achieved: { color: '#16a34a', backgroundColor: '#dcfce7' },
      'Partly Achieved': { color: '#ca8a04', backgroundColor: '#fef9c3' },
      'Not Achieved': { color: '#dc2626', backgroundColor: '#fee2e2' },
      '': { color: '#4b5563', backgroundColor: '#f3f4f6' },
    };
    return map[rating] ?? { color: '#4b5563', backgroundColor: '#f3f4f6' };
  };

  const getPerformanceRatingStyle = (rating: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      'Exceeds Expectations': { color: '#16a34a', backgroundColor: '#dcfce7' },
      'Meets Expectations': { color: '#2563eb', backgroundColor: '#dbeafe' },
      'Needs Improvement': { color: '#ea580c', backgroundColor: '#ffedd5' },
      Pending: { color: '#4b5563', backgroundColor: '#f3f4f6' },
    };
    return map[rating] ?? { color: '#4b5563', backgroundColor: '#f3f4f6' };
  };

  const getUserName = (user: Partial<IUser> | string | null | undefined): string => {
    if (!user) return 'N/A';
    if (typeof user === 'object') {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
    }
    return user || 'N/A';
  };

  // Staff name comes straight off the populated staffId (falls back to
  // createdBy, which is usually the same person). No flat staffName field.
  const getStaffName = (): string => {
    if (request.staffId && typeof request.staffId === 'object') return getUserName(request.staffId);
    return getUserName(request.createdBy);
  };

  // Position comes from the staff member's current job title on their
  // populated profile — there's no separate snapshot on the appraisal.
  const getPosition = (): string => {
    if (request.staffId && typeof request.staffId === 'object') {
      return request.staffId.employmentInfo?.jobDetails?.title || 'N/A';
    }
    return 'N/A';
  };

  // Supervisor name comes from the populated supervisorId.
  const getSupervisorDisplayName = (): string => {
    if (request.supervisorId && typeof request.supervisorId === 'object') {
      return getUserName(request.supervisorId);
    }
    return 'N/A';
  };

  // Check if user can edit the entire appraisal
  const canEditFull =
    isAdmin ||
    (isStaff && request.status === 'draft') ||
    (isSupervisor && request.status === 'pending');

  return (
    <DetailContainer>
      {/* Appraisal Header */}
      {request?.appraisalCode && (
        <h1 className="text-center text-lg font-extrabold p-3">{request.appraisalCode}</h1>
      )}

      {/* Edit Button */}
      {canEditFull && (
        <div className="flex justify-end mb-4">
          <Button
            type="button"
            size="sm"
            onClick={() => navigate(`/human-resources/appraisals/edit/${appraisalId}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Appraisal
          </Button>
        </div>
      )}

      <div
        className={`flex flex-col gap-6 w-full ${
          !appraisalId ? 'text-sm' : 'text-sm md:text-base'
        } mb-6 break-words`}
      >
        {/* Section 1: Staff Information */}
        <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
          <h3 className="text-lg capitalize font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
            SECTION 1: STAFF INFORMATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Staff Name
              </label>
              <p className="text-gray-800">{getStaffName()}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Position
              </label>
              <p className="text-gray-800">{getPosition()}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Department
              </label>
              <p className="text-gray-800">{request.department || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Length of Time in Position
              </label>
              <p className="text-gray-800">{request.lengthOfTimeInPosition || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Appraisal Period
              </label>
              <p className="text-gray-800">{request.appraisalPeriod || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Date of Appraisal
              </label>
              <p className="text-gray-800">
                {request.dateOfAppraisal
                  ? new Date(request.dateOfAppraisal).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          <h4 className="text-md font-semibold text-gray-800 mt-4 mb-2">Supervisor Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Name of Supervisor
              </label>
              <p className="text-gray-800">{getSupervisorDisplayName()}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Length of Time Supervised
              </label>
              <p className="text-gray-800">{request.lengthOfTimeSupervised || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Performance Objectives */}
        {request.objectives && request.objectives.length > 0 && (
          <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
            <h3 className="text-lg capitalize font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
              SECTION 2: PERFORMANCE OBJECTIVES
            </h3>
            <div className="space-y-4">
              {request.objectives.map((obj, index) => {
                const empRating = getEmployeeRating(obj.employeeRating);
                const empAchievements = getEmployeeAchievements(obj.employeeRating);
                return (
                  <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                    {/* Objective title */}
                    <p className="font-semibold text-gray-800 mb-3">
                      {index + 1}. {obj.objective || `Objective ${index + 1}`}
                    </p>

                    {/* Both ratings on the same row */}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {/* Employee Rating */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                          Employee Rating
                        </span>
                        {empRating ? (
                          <span
                            style={getRatingStyle(empRating)}
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                          >
                            {empRating} ({obj.employeePoints} pts)
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Not rated</span>
                        )}
                        {canEditStaffSections && (
                          <span className="text-xs text-blue-500">(You can edit)</span>
                        )}
                      </div>

                      {/* Supervisor Rating */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                          Supervisor Rating
                        </span>
                        {obj.supervisorRating ? (
                          <span
                            style={getRatingStyle(obj.supervisorRating)}
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                          >
                            {obj.supervisorRating} ({obj.supervisorPoints} pts)
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Not rated</span>
                        )}
                        {canEditSupervisorSections && (
                          <span className="text-xs text-blue-500">(You can edit)</span>
                        )}
                      </div>
                    </div>

                    {/* Achievements — full width below the ratings row */}
                    {empAchievements ? (
                      <div className="border-t border-gray-100 pt-3">
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500 block mb-1">
                          Employee Achievements
                        </span>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-2 border border-gray-100">
                          {empAchievements}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Safeguarding Section */}
            {request.safeguarding && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Safeguarding</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                      Actions Taken
                    </label>
                    <p className="text-gray-800">{request.safeguarding.actionsTaken || 'N/A'}</p>
                    {canEditStaffSections && (
                      <span className="text-xs text-blue-500">(You can edit)</span>
                    )}
                  </div>
                  {/* Legacy field — only present on records saved before the per-objective achievements migration */}
                  {(request as any).achievements && (
                    <div>
                      <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                        Achievements (legacy)
                      </label>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-2 border border-gray-100">
                        {(request as any).achievements}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                      Training Completed
                    </label>
                    <span
                      style={
                        request.safeguarding.trainingCompleted === 'Yes'
                          ? { color: '#16a34a', backgroundColor: '#dcfce7' }
                          : request.safeguarding.trainingCompleted === 'Partly'
                            ? { color: '#ca8a04', backgroundColor: '#fef9c3' }
                            : { color: '#dc2626', backgroundColor: '#fee2e2' }
                      }
                      className="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {request.safeguarding.trainingCompleted}
                    </span>
                  </div>
                  {request.safeguarding.areasNotUnderstood?.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                        Areas Not Understood
                      </label>
                      <ul className="list-disc list-inside">
                        {request.safeguarding.areasNotUnderstood.map((area, i) => (
                          <li key={i} className="text-gray-800">
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 3: Supervisor's Assessment */}
        {request.performanceAreas && request.performanceAreas.length > 0 && (
          <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
            <h3 className="text-lg capitalize font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
              SECTION 3: SUPERVISOR'S ASSESSMENT
            </h3>
            <div className="space-y-3">
              {request.performanceAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-white rounded-lg"
                >
                  <span className="font-medium text-gray-700">{area.area}:</span>
                  <span
                    style={getPerformanceRatingStyle(area.rating)}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {area.rating}
                  </span>
                </div>
              ))}
            </div>

            {request.supervisorComments && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                  Supervisor's Comments
                </label>
                <p className="text-gray-800">{request.supervisorComments}</p>
                {canEditSupervisorSections && (
                  <span className="text-xs text-blue-500">(You can edit)</span>
                )}
              </div>
            )}

            {request.overallRating && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                  Overall Assessment
                </label>
                <p
                  style={{
                    color:
                      request.overallRating === 'Meets Requirements'
                        ? '#16a34a'
                        : request.overallRating === 'Partly Meets Requirements'
                          ? '#ca8a04'
                          : request.overallRating === 'Does Not Meet Requirements'
                            ? '#dc2626'
                            : '#4b5563',
                    fontWeight: 600,
                  }}
                >
                  {request.overallRating}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Section 4: Future Goals */}
        {request.futureGoals && (
          <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
            <h3 className="text-lg capitalize font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
              SECTION 4: FUTURE GOALS
            </h3>
            <p className="text-gray-800">{request.futureGoals}</p>
          </div>
        )}

        {/* Scores Summary */}
        {request.scores && (
          <div className="rounded-lg p-4 border bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">SCORES SUMMARY</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">Employee Total</div>
                <div style={{ color: '#2563eb' }} className="text-2xl font-bold">
                  {request.scores.employeeTotal}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">Supervisor Total</div>
                <div style={{ color: '#16a34a' }} className="text-2xl font-bold">
                  {request.scores.supervisorTotal}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Performance Areas</div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: '#ea580c' }}>
                    Needs Improvement: {request.scores.performanceAreasCount.needsImprovement}
                  </span>
                  <span style={{ color: '#2563eb' }}>
                    Meets: {request.scores.performanceAreasCount.meetsExpectations}
                  </span>
                  <span style={{ color: '#16a34a' }}>
                    Exceeds: {request.scores.performanceAreasCount.exceedsExpectations}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <FileAttachmentContainer
        modelName="Appraisal"
        id={request.id}
        status={request.status}
        canManage={true}
      />
      </div>
    </DetailContainer>
  );
};
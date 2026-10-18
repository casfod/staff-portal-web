import { List, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '../../components/ui/button';
import TextHeader from '../../components/custom/TextHeader';
import StatusBadge from '../../components/custom/StatusBadge';
import ActionIcons from '../../components/custom/ActionIcons';
import RequestDetailLayout, { TRequestEntity } from '../../components/custom/RequestDetailLayout';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import { DataStateContainer } from '../../components/custom/DataStateContainer';
import StoreRequestCard from './StoreRequestCard';
import StoreRequestDetails from './StoreRequestDetails';
import { RootState } from '../../store/store';
import { localStorageUser } from '../../utils/localStorageUser';
import { getUserFullName } from '../../utils/getUserFullName';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter';
import { IComment, IRequestDetailFormData } from '../../interfaces';
import { useAdmins } from '../user/Hooks/useUsers';
import { useRequestPermissions } from '../../hooks/useRequestPermissions';
import { useStatusUpdate } from '../../hooks/useStatusUpdate';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import { getStoreTableHeaders } from '@/config/tableConfigs';
import { infoConfig } from '@/config/config-info';
import {
	useAddStoreRequestComment,
	useCopyStoreRequest,
	useDeleteStoreRequestComment,
	useStoreRequest,
	useUpdateStoreRequest,
	useUpdateStoreRequestComment,
	useUpdateStoreRequestStatus,
} from './Hooks/useStoreRequest';

const StoreRequest = () => {
	const currentUser = localStorageUser();
	const navigate = useNavigate();
	const { requestId } = useParams();

	const { data: remoteData, isLoading, isError } = useStoreRequest(requestId ?? '');
	const cachedRequest = useSelector((state: RootState) => state.storeRequest.storeRequest);
	const request = useMemo(
		() => remoteData?.data ?? (cachedRequest?.id === requestId ? cachedRequest : null),
		[remoteData, cachedRequest, requestId]
	);

	useEffect(() => {
		if (!requestId || (!isLoading && !request)) {
			navigate('/store-requests');
		}
	}, [request, requestId, navigate, isLoading]);

	const [status, setStatus] = useState('');
	const [comment, setComment] = useState('');
	const [formData, setFormData] = useState<IRequestDetailFormData>({ approvedBy: undefined });
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [showTagDropdown, setShowTagDropdown] = useState(false);

	const { handleStatusChange } = useStatusUpdate();
	const { updateStoreRequestStatus, isPending: isUpdatingStatus } =
		useUpdateStoreRequestStatus(requestId ?? '');
	const { updateStoreRequest, isPending: isUpdating } = useUpdateStoreRequest(requestId ?? '');
	const { copyStoreRequest, isPending: isCopying } = useCopyStoreRequest(requestId ?? '');
	const { addStoreRequestComment, isPending: isAddingComment } =
		useAddStoreRequestComment(requestId ?? '');
	const { updateStoreRequestComment, isPending: isUpdatingComment } =
		useUpdateStoreRequestComment(requestId ?? '');
	const { deleteStoreRequestComment, isPending: isDeletingComment } =
		useDeleteStoreRequestComment(requestId ?? '');

	const { data: adminsData, isLoading: isLoadingAdmins } = useAdmins();
	const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);
	const permissions = useRequestPermissions({ request, currentUser, isTwoStep: false });

	const pdfContentRef = useRef<HTMLDivElement>(null);
	const { downloadPdf, isGenerating } = usePdfDownload({
		filename: `${infoConfig.abbriviation}-StoreRequest-${request?.id ?? requestId}`,
		multiPage: true,
		titleOptions: {
			text: `${infoConfig.abbriviation} Store Request : ${capitalizeFirstLetter(request?.status ?? '')}`,
		},
		footerCode: {
			label: `${infoConfig.abbriviation} Store Request`,
			value: request?.srCode ?? '',
		},
	});

	const handleFormChange = (field: string, value: string) => {
		setFormData(previous => ({ ...previous, [field]: value }));
	};

	const handleDownloadPDF = () => downloadPdf(pdfContentRef);

	const onStatusChangeHandler = () => {
		handleStatusChange(status, comment, async data => {
			await updateStoreRequestStatus(data);
		});
	};

	const handleSend = (event: React.FormEvent) => {
		event.preventDefault();
		updateStoreRequest({ approvedBy: formData.approvedBy || undefined });
	};

	const handleAddComment = async (text: string) => {
		await addStoreRequestComment({ text });
	};

	const handleUpdateComment = async (commentId: string, text: string) => {
		await updateStoreRequestComment({ commentId, text });
	};

	const handleDeleteComment = async (commentId: string) => {
		await deleteStoreRequestComment(commentId);
	};

	const comments = (request?.comments ?? []) as IComment[];
	const tableHeadData = getStoreTableHeaders();

	if (isError) return <NetworkErrorUI />;

	return (
		<div className="flex flex-col space-y-3 pb-80">
			<div className="sticky -top-8 z-10 space-y-1.5 border-b bg-[#F8F8F8] pb-3 pt-4 md:pt-6">
				<div className="flex items-center justify-between">
					<TextHeader>Store Request</TextHeader>
					<Button variant="outline" size="sm" onClick={() => navigate('/store-requests')}>
						<List className="mr-1 h-4 w-4 md:mr-2" />
						List
					</Button>
				</div>
			</div>

			<DataStateContainer
				isLoading={isLoading}
				isError={isError}
				data={request}
				errorComponent={<NetworkErrorUI />}
				loadingComponent={
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-brand-600" />
					</div>
				}
				emptyComponent={<div>No data available</div>}
			>
				{request && (
					<div className="overflow-hidden rounded-lg border bg-white shadow-sm">
						<div className="overflow-x-auto">
							<table className="w-full divide-y divide-gray-200">
								<thead className="hidden bg-gray-50 sm:table-header-group">
									<tr>
										{tableHeadData.map((header, index) => (
											<th
												key={`${header.label}-${index}`}
												className={`whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:px-4 md:py-3 ${!header.showOnMobile ? 'hidden md:table-cell' : ''} ${header.showOnTablet ? 'hidden sm:table-cell md:table-cell' : ''}`}
												style={{ minWidth: header.minWidth }}
											>
												{header.label}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 bg-white">
									<tr className="hidden sm:table-row">
										<td className="px-3 py-2.5 text-sm md:px-4 md:py-3">
											{getUserFullName(request.createdBy)}
										</td>
										<td className="px-3 py-2.5 text-sm md:px-4 md:py-3 capitalize">
											{request.requestType}
										</td>
										<td className="px-3 py-2.5 text-sm md:px-4 md:py-3">{request.srCode || 'N/A'}</td>
										<td className="px-3 py-2.5 text-sm md:px-4 md:py-3">
											<StatusBadge status={request.status} />
										</td>
										<td className="table-cell px-3 py-2.5 text-sm md:px-4 md:py-3">
											{formatToDDMMYYYY(request.requestedAt || request.createdAt)}
										</td>
										<td className="px-3 py-2.5 text-sm md:px-4 md:py-3">
											<ActionIcons
												copyTo={copyStoreRequest}
												isCopying={isCopying}
												canShareRequest={permissions.canShare}
												requestId={request.id}
												isGeneratingPDF={isGenerating}
												onDownloadPDF={handleDownloadPDF}
												showTagDropdown={showTagDropdown}
												setShowTagDropdown={setShowTagDropdown}
												hideInspect
											/>
										</td>
									</tr>

									<tr className="sm:hidden">
										<td colSpan={tableHeadData.length} className="border-b border-gray-200 p-4">
											<StoreRequestCard
												storeRequest={request}
												requestId={request.id}
												actionIconsProps={{
													copyTo: copyStoreRequest,
													isCopying,
													canShareRequest: permissions.canShare,
													isGeneratingPDF: isGenerating,
													onDownloadPDF: handleDownloadPDF,
													showTagDropdown,
													setShowTagDropdown,
													hideInspect: true,
												}}
												context="detail"
											/>
										</td>
									</tr>

									<tr>
										<td colSpan={tableHeadData.length} className="px-3 py-4 md:px-6">
											<RequestDetailLayout
												request={request as unknown as TRequestEntity}
												requestStatus={request.status}
												canUploadFiles={permissions.canUploadFiles}
												selectedFiles={selectedFiles}
												setSelectedFiles={setSelectedFiles}
												isUploading={isUpdating}
												handleUpload={handleSend}
												canUpdateStatus={permissions.canUpdateStatus}
												status={status}
												setStatus={setStatus}
												comment={comment}
												setComment={setComment}
												isUpdatingStatus={isUpdatingStatus}
												handleStatusChange={onStatusChangeHandler}
												comments={comments}
												canAddComments={permissions.canAddComments}
												handleAddComment={handleAddComment}
												handleUpdateComment={handleUpdateComment}
												handleDeleteComment={handleDeleteComment}
												isAddingComment={isAddingComment}
												isUpdatingComment={isUpdatingComment}
												isDeletingComment={isDeletingComment}
												showAdminApproval={permissions.showAdminApproval}
												formData={formData}
												handleFormChange={handleFormChange}
												admins={admins}
												isLoadingAmins={isLoadingAdmins}
											>
												<div ref={pdfContentRef}>
													<StoreRequestDetails request={request} />
												</div>
											</RequestDetailLayout>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				)}
			</DataStateContainer>
		</div>
	);
};

export default StoreRequest;

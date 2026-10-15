import BaseRequestCard, { RequestCardWrapperProps } from '../../components/custom/BaseRequestCard';
import { getUserFullName } from '../../utils/getUserFullName';
import { IStoreRequest } from '../../interfaces';

interface StoreRequestCardProps extends RequestCardWrapperProps {
	storeRequest: IStoreRequest;
}

const StoreRequestCard = ({ storeRequest, requestId, ...rest }: StoreRequestCardProps) => (
	<BaseRequestCard
		displayName={getUserFullName(storeRequest.createdBy)}
		identifier={storeRequest.srCode}
		status={storeRequest.status}
		date={storeRequest.requestedAt || storeRequest.createdAt}
		requestId={requestId ?? storeRequest.id}
		additionalInfo={
			<span className="text-xs capitalize text-gray-600">{storeRequest.requestType} request</span>
		}
		{...rest}
	/>
);

export default StoreRequestCard;

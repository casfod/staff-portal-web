// EditVendor.tsx - Optimized with Radix UI
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { List } from 'lucide-react';
import { Button } from '../../components/ui/button';
import TextHeader from '../../components/custom/TextHeader';
import VendorForm from './VendorForm';

const EditVendor = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams();

  const vendor = useSelector((state: RootState) => state.vendor.vendor);

  useEffect(() => {
    if (!vendorId || !vendor) {
      navigate('/procurement/vendor-management');
    }
  }, [vendor, vendorId, navigate]);

  if (!vendor) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No vendor data available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Update Vendor</TextHeader>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="border w-full rounded-lg">
        <div className="bg-white bg-opacity-90 py-4 md:py-6 lg:py-10 px-2 md:px-6 lg:px-12 w-full rounded-lg">
          <VendorForm
            mode="edit"
            initialData={vendor}
            onSuccess={() => navigate('/procurement/vendor-management')}
          />
        </div>
      </div>
    </div>
  );
};

export default EditVendor;

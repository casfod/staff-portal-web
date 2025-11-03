// components/payment-vouchers/EditPaymentVoucher.tsx
import { useNavigate, useParams } from "react-router-dom";
import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useEffect } from "react";
import Button from "../../ui/Button";
import TextHeader from "../../ui/TextHeader";
import FormEditPaymentVoucher from "./FormEditPaymentVoucher";

const EditPaymentVoucher = () => {
  const navigate = useNavigate();
  const param = useParams();

  const paymentVoucher = useSelector(
    (state: RootState) => state.paymentVoucher.paymentVoucher
  );

  useEffect(() => {
    if (!param || !paymentVoucher) {
      navigate("/finance/payment-voucher");
    }
  }, [paymentVoucher, param, navigate]);

  if (!paymentVoucher) {
    return <div>No payment voucher data available.</div>;
  }

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Update Payment Voucher</TextHeader>

          <Button onClick={() => navigate(-1)}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="border w-full rounded-lg">
        <div className="bg-white bg-opacity-90 py-4 md:py-6 lg:py-10 px-2 md:px-6 lg:px-12 w-full rounded-lg">
          <FormEditPaymentVoucher paymentVoucher={paymentVoucher} />
        </div>
      </div>
    </div>
  );
};

export default EditPaymentVoucher;

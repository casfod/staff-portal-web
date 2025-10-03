// components/RFQ/RFQPDFTemplate.tsx
import React from "react";
import logo from "../../assets/logo.webp";
import { UserType } from "../../interfaces";
// import { useRFQPDF } from "../../hooks/useRFQPDF";

interface RFQPDFTemplateProps {
  pdfRef?: any;
  isGenerating?: boolean;
  rfqData: {
    RFQTitle: string;
    RFQCode: string;
    itemGroups: Array<{
      description: string;
      frequency: number;
      quantity: number;
      unit: string;
      unitCost: number;
      total: number;
    }>;
    deliveryPeriod: string;
    bidValidityPeriod: string;
    guaranteePeriod: string;
    createdBy?: UserType;
    createdAt?: string;
  };
}

const RFQPDFTemplate: React.FC<RFQPDFTemplateProps> = ({
  isGenerating = false,
  rfqData,
  pdfRef,
}) => {
  const grandTotal = rfqData.itemGroups.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return (
    <div
      ref={pdfRef}
      className="pdf-container bg-white p-8"
      style={{
        fontFamily: "Arial, sans-serif",
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
      }}
    >
      {/* Header with Logo */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-gray-300 pb-4">
        <div className="flex items-start">
          <div className="mr-4">
            <img src={logo} alt="logo" className="w-44 h-22" />
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold text-gray-700">
            Request for Quotation
          </h2>
          <p className="text-md font-semibold text-blue-600 mt-1">
            {rfqData.RFQCode}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Date: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="mb-6 p-4 bg-gray-50 border-l-4 border-blue-500">
        <h3 className="font-bold mb-2 text-lg text-gray-700">
          Delivery address:
        </h3>
        <p className="text-md text-gray-600">
          Unique Care and Support Foundation
          <br />
          No B84 Mandau Street Bulunkutu
          <br />
          Maiduguri Borno State
          <br />
          Nigeria
        </p>
      </div>

      {/* Introduction */}
      <div className="mb-6">
        <p className="leading-relaxed text-md text-gray-700">
          The Unique Care and Support Foundation (CASFOD) invites your company
          to submit a price quotation for the following items in accordance with
          the requirements detailed below. You may use your company format, or
          fill up the table below. Please read the instruction carefully.
        </p>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 text-gray-800 border-b pb-1">
          Terms and Conditions as per CASFOD's Policy
        </h3>
        <ul className="text-md text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Payment terms: Payment will be made after delivery and acceptance
              of goods
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              All responses to this RFQ will be treated as confidential.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              CASFOD reserves the right to accept or reject any quotations.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Bidders shall adhere to all the requirements of this RFQ
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              CASFOD enforces a withholding tax deduction on the total
              contractual sum. CASFOD reserves the right to validate
              documentation accuracy. Inquiries or clarifications on tax matters
              should be communicated before the RFQ submission deadline.
              Participation implies vendor agreement to the outlined withholding
              tax and VAT exemption policies
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Language in which Quotation will be submitted must be in English.
            </span>
          </li>
        </ul>
      </div>

      {/* Evaluation Criteria */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 text-gray-800 border-b pb-1">
          Evaluation Criteria
        </h3>
        <ul className=" text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Bidder can legally operate in Nigeria as a business entity (attach
              copies of proof of business registration CAC)
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Completely filled, signed and stamped Quotation page to page to be
              submitted
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Evidence of TIN Registration</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Delivery Period</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Best Price</span>
          </li>
        </ul>
      </div>

      {isGenerating && <div className="h-40"></div>}

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left font-bold">
                SN
              </th>
              <th className="border border-gray-300 p-2 text-left font-bold">
                ITEM NAME
              </th>
              {/* <th className="border border-gray-300 p-2 text-left font-bold">
                DETAIL DESCRIPTION
              </th> */}

              <th className="border border-gray-300 p-2 text-left font-bold">
                QUANTITY
              </th>
              <th className="border border-gray-300 p-2 text-left font-bold">
                FREQUENCY
              </th>
              <th className="border border-gray-300 p-2 text-left font-bold">
                UNIT
              </th>
              <th className="border border-gray-300 p-2 text-left font-bold">
                UNIT COST
              </th>
              <th className="border border-gray-300 p-2 text-left font-bold">
                TOTAL COST
              </th>
            </tr>
          </thead>
          <tbody>
            {rfqData.itemGroups.map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="border border-gray-300 p-2 text-sm">
                  {index + 1}
                </td>
                <td className="border border-gray-300 p-2 text-sm">
                  {item.description.split(" ").slice(0, 2).join(" ")}
                </td>
                {/* <td className="border border-gray-300 p-2 text-sm">
                  {item.description}
                </td> */}

                <td className="border border-gray-300 p-2 text-sm text-right">
                  {item.quantity.toLocaleString()}
                </td>
                <td className="border border-gray-300 p-2 text-sm text-right">
                  {item.frequency.toLocaleString()}
                </td>
                <td className="border border-gray-300 p-2 text-sm">
                  {item.unit || "-"}
                </td>
                <td className="border border-gray-300 p-2 text-sm text-right">
                  {item.unitCost > 0 ? item.unitCost.toLocaleString() : ""}
                </td>
                <td className="border border-gray-300 p-2 text-sm text-right">
                  {item.total > 0 ? item.unitCost.toLocaleString() : ""}
                </td>
              </tr>
            ))}
            {/* Grand Total Row */}
            <tr className="bg-gray-100 font-bold">
              <td
                colSpan={6}
                className="border border-gray-300 p-2 text-right text-sm"
              >
                GRAND TOTAL:
              </td>
              <td className="flex items-start border border-gray-300 p-2 text-right text-sm ">
                ₦{grandTotal > 0 ? grandTotal.toLocaleString() : ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Periods Table */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-semibold bg-gray-100 w-1/3 text-sm">
                Delivery Period (in days, from receipt of CASFOD Purchase Order)
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {rfqData.deliveryPeriod || ""}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-semibold bg-gray-100 text-sm">
                Bid Validity Period (in days from receipt of CASFOD Purchase
                Order):
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {rfqData.bidValidityPeriod || ""}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-semibold bg-gray-100 text-sm">
                Guarantee period:
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {rfqData.guaranteePeriod || ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Attachments */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 text-sm text-gray-800 border-b pb-1">
          Kindly Attached the following:
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Business Registration Certificate</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Tax Clearance Certificate</span>
          </li>
        </ul>
      </div>

      {/* Contact Information */}
      <div className="mt-8 pt-4 border-t border-gray-300">
        <p className="text-sm text-gray-700">
          For any clarification regarding the RFQ, please send an email to{" "}
          <span className="font-semibold text-blue-600">
            procurement@casfod.org
          </span>
          .
        </p>
      </div>
    </div>
  );
};

export default RFQPDFTemplate;

## Analysis and Optimization

Looking at the files provided, I can see that `RequestCard` is being used across multiple features and needs to handle various data structures. Let me optimize it to be more flexible and type-safe for all use cases.

## 2. optimization-context.md - Updated

````markdown
# Frontend Optimization Context - Complete Feature List

## Frontend Optimization Context

### Radix UI Migration & Feature Optimization

### Project Overview

- **Project**: NGO Frontend TypeScript
- **Goal**: Standardize UI components using Radix UI throughout all features
- **Pattern**: Feature-based optimization with reusable patterns
- **Status**: In Progress

---

## COMPLETED FEATURES ✅

### 1. User Management

**Status**: ✅ Complete
**Files Optimized**:

- AllUsers.tsx - Optimized with Radix UI components
- UserCard.tsx - Rewritten with Radix UI (Select, Checkbox, Switch, Badge)
- UsersTableRow.tsx - Added expandable dropdown with StaffDetails
- AddUserForm.tsx - Enhanced with Radix UI

**Key Changes**:

- Replaced custom Select with Radix UI Select
- Replaced custom Badges with Radix UI Badge
- Added expandable row pattern with Chevron icons
- Used Loader2 for loading states
- Integrated StaffDetails in expandable section

---

### 2. Project Management

**Status**: ✅ Complete
**Files Optimized**:

- AllProjects.tsx - Optimized with Radix UI
- ProjectTableRow.tsx - Added expandable dropdown
- ProjectFormFields.tsx - Optimized with Radix UI
- ProjectDetails.tsx - Enhanced with Badge components
- CreateProject.tsx, EditProject.tsx - Consistent styling

**Key Changes**:

- Replaced custom FormRow with Radix UI Label
- Consistent Select usage across forms
- Added expandable row pattern
- Status badges with Radix UI Badge
- Improved form layout with consistent spacing

---

### 3. Advance Request

**Status**: ✅ Complete
**Files Optimized**:

1. ✅ AllAdvanceRequests.tsx - List view optimized
2. ✅ AdvanceRequestTableRow.tsx - Expandable row pattern
3. ✅ AdvanceRequest.tsx - Detail view optimized
4. ✅ AdvanceRequestDetails.tsx - Details component
5. ✅ CreateAdvanceRequest.tsx - Page wrapper
6. ✅ EditAdvanceRequest.tsx - Page wrapper
7. ✅ AdvanceRequestForm.tsx - Combined create/edit form

**Key Changes**:

- Combined FormAddAdvanceRequest and FormEditAdvanceRequest into single `AdvanceRequestForm.tsx`
- Applied expandable row pattern with Chevron icons
- Replaced custom Select with Radix UI Select
- Replaced custom Badge with Radix UI Badge
- Used Loader2 for loading states
- Consistent form layout with Radix UI Label
- Fixed TypeScript errors with RequestCard compatibility
- Added `toRequestCardFormat` helper for type safety

---

### 4. Purchase Request

**Status**: ✅ Complete
**Files Optimized**:

1. ✅ AllPurchaseRequests.tsx - List view optimized
2. ✅ PurchaseRequestTableRow.tsx - Expandable row pattern
3. ✅ PurchaseRequest.tsx - Detail view optimized
4. ✅ PurchaseRequestDetails.tsx - Details component
5. ✅ CreatePurchaseRequest.tsx - Page wrapper
6. ✅ EditRequest.tsx - Page wrapper
7. ✅ PurchaseRequestForm.tsx - Combined create/edit form

**Key Changes**:

- Combined FormAddPurchaseRequest and FormEditPurchaseRequest into single `PurchaseRequestForm.tsx`
- Applied expandable row pattern with Chevron icons
- Two-step approval flow (Finance + Procurement reviewers)
- Replaced custom Select with Radix UI Select
- Used Loader2 for loading states
- Fixed TypeScript errors with RequestCard compatibility

---

### 5. RequestCard (Shared Component)

**Status**: ✅ Complete
**Files Optimized**:

1. ✅ RequestCard.tsx - Unified component for all request types

**Key Changes**:

- Added `RequestType` type supporting all navigation sections:
  - **Projects**: project
  - **Requests**: conceptNote, purchaseRequest, paymentRequest, advanceRequest, travelRequest, expenseClaim
  - **Reporting**: report
  - **Procurement**: rfq, purchaseOrder, goodsReceived, paymentVoucher
  - **HR**: leave, staffStrategy, appraisal
  - **Vendor**: vendor
- Added `typeConfigs` for field mappings per request type
- Added `getNestedValue` helper for deep property access
- Added `getIdentifier`, `getDisplayName`, `getDate` helpers
- Support for explicit prop overrides (`displayName`, `identifierField`, `dateField`)
- Type-safe with `IBaseRequest` interface

---

## PENDING FEATURES 📋

### 6. Concept Note

**Files to Optimize**:

- AllConceptNotes.tsx
- ConceptNote.tsx
- ConceptNoteDetails.tsx
- ConceptNoteTableRow.tsx
- CreateConceptNote.tsx
- EditConceptNote.tsx
- FormAddConceptNotes.tsx
- FormEditConceptNotes.tsx

**Actions Needed**:

- [ ] Apply optimization patterns
- [ ] Combine forms
- [ ] Expandable table rows

---

### 7. Expense Claim

**Files to Optimize**:

- AllExpenseClaims.tsx
- ExpenseClaim.tsx
- ExpenseClaimDetails.tsx
- ExpenseClaimTableRow.tsx
- CreateExpenseClaim.tsx
- EditExpenseClaim.tsx
- FormAddExpenseClaim.tsx
- FormEditExpenseClaim.tsx

**Actions Needed**:

- [ ] Apply optimization patterns
- [ ] Combine forms
- [ ] Expandable table rows

---

### 8. Goods Received (GRN)

**Files to Optimize**:

- AllGRN.tsx
- GRN.tsx
- GRNDetails.tsx
- GRNTableRow.tsx
- FormCreateGoodsReceived.tsx
- GoodsReceivedList.tsx
- GRNPDFTemplate.tsx

**Actions Needed**:

- [ ] Apply optimization patterns
- [ ] Combine forms
- [ ] Expandable table rows

---

### 9. Leave Management

**Files to Optimize**:

- AllLeaves.tsx
- Leave.tsx
- LeaveDetails.tsx
- LeaveTableRow.tsx
- CreateLeave.tsx
- EditLeave.tsx
- FormAddLeave.tsx
- FormEditLeave.tsx

**Actions Needed**:

- [ ] Apply optimization patterns
- [ ] Combine forms
- [ ] Expandable table rows

---

### 10. Payment Request

**Files to Optimize**:

- AllPaymentRequests.tsx
- PaymentRequest.tsx
- PaymentRequestDetails.tsx
- PaymentRequestTableRow.tsx
- CreatePaymentRequest.tsx
- EditPaymentRequest.tsx
- FormAddPaymentRequest.tsx
- FormEditPaymentRequest.tsx

**Actions Needed**:

- [ ] Apply optimization patterns
- [ ] Combine forms
- [ ] Expandable table rows

---

### 11. Payment Voucher

**Files to Optimize**:

- AllPaymentVouchers.tsx
- PaymentVoucher.tsx
- PaymentVoucherDetails.tsx
- PaymentVoucherTableRow.tsx
- CreatePaymentVoucher.tsx
- EditPaymentVoucher.tsx
- FormAddPaymentVoucher.tsx
- FormEditPaymentVoucher.tsx
- PVPDFTemplate.tsx

**Actions Needed**:

- [ ] Apply optimization patterns
- [ ] Combine forms
- [ ] Expandable table rows

---

### 12. Purchase Order

**Files to Optimize**:

- AllPurchaseOrders.tsx
- PurchaseOrder.tsx
- PurchaseOrderDetails.tsx
- PurchaseOrderTableRow.tsx
- CreatePurchaseOrder.tsx
- CreatePurchaseOrderFromRFQ.tsx
- EditPurchaseOrder.tsx
- FormCreatePurchaseOrder.tsx
- FormCreatePurchaseOrderFromRFQ.tsx
- FormEditPurchaseOrder.tsx
- POPDFTemplate.tsx

**Actions Needed**:

- [ ] Apply optimization patterns
- [ ] Combine forms
- [ ] Expandable table rows

---

### 13. Report

**Files to Optimize**:

- AllReports.tsx
- Report.tsx
- ReportDetails.tsx
- ReportTableRow.tsx
- CreateReport.tsx
- EditReport.tsx
- FormAddReport.tsx
- FormEditReport.tsx

**Actions Needed**:

- [ ] Apply optimization patterns
- [ ] Combine forms
- [ ] Expandable table rows

---

### 14. RFQ (Request for Quotation)

**Files to Optimize**:

- AllRFQs.tsx
- RFQ.tsx
- RFQDetails.tsx
- RFQTableRow.tsx
- CreateRFQ.tsx
- EditRFQ.tsx
- FormAddRFQ.tsx
- FormEditRFQ.tsx
- RFQPDFTemplate.tsx

**Actions Needed**:

- [ ] Apply optimization patterns
- [ ] Combine forms
- [ ] Expandable table rows

---

### 15. Staff Strategy

**Files to Optimize**:

- AllStaffStrategies.tsx
- StaffStrategy.tsx
- StaffStrategyDetails.tsx
- StaffStrategyTableRow.tsx
- CreateStaffStrategy.tsx
- EditStaffStrategy.tsx
- FormAddStaffStrategy.tsx
- FormEditStaffStrategy.tsx

**Actions Needed**:

- [ ] Apply optimization patterns
- [ ] Combine forms
- [ ] Expandable table rows

---

### 16. Travel Request

**Files to Optimize**:

- AllTravelRequests.tsx
- TravelRequest.tsx
- TravelRequestDetails.tsx
- TravelRequestTableRow.tsx
- CreateTravelRequest.tsx
- EditTravelRequest.tsx
- FormAddTravelRequest.tsx
- FormEditTravelRequest.tsx

**Actions Needed**:

- [ ] Apply optimization patterns
- [ ] Combine forms
- [ ] Expandable table rows

---

### 17. Vendor Management

**Files to Optimize**:

- AllVendors.tsx
- Vendor.tsx
- VendorDetails.tsx
- VendorTableRow.tsx
- CreateVendor.tsx
- EditVendor.tsx
- FormAddVendor.tsx
- FormEditVendor.tsx

**Actions Needed**:

- [ ] Apply optimization patterns
- [ ] Combine forms
- [ ] Expandable table rows

---

## OPTIMIZATION PATTERNS

### 1. Table Row Pattern (Expandable)

```tsx
// Pattern for all list views
const [isExpanded, setIsExpanded] = useState(false);

// In table row:
<button onClick={() => setIsExpanded(!isExpanded)}>
  {isExpanded ? <ChevronDown /> : <ChevronRight />}
</button>;

// Expanded section:
{
  isExpanded && (
    <tr>
      <td colSpan={headers.length}>
        <DetailsComponent request={request} />
      </td>
    </tr>
  );
}
```
````

### 2. Form Pattern (Single Form Component)

```tsx
// Combine Add/Edit into single FormComponent
interface FormComponentProps {
  mode: 'create' | 'edit';
  initialData?: T; // For edit mode
}
```

### 3. RequestCard Pattern (Unified)

```tsx
// RequestCard now supports all request types via the `type` prop
<RequestCard
  type="advanceRequest"  // or 'purchaseRequest', 'project', etc.
  request={request}
  totalAmount={totalAmount}
  requestId={requestId}
  identifier={request.arNumber}
  dateValue={request.createdAt}
  actionIconsProps={{...}}
  context="list"
/>
```

### 4. Component Replacement Map

| Custom Component    | Radix UI Replacement                   |
| ------------------- | -------------------------------------- |
| FormRow             | Label + div wrapper                    |
| Row                 | Tailwind grid                          |
| Spinner/SpinnerMini | Loader2 from lucide-react              |
| Select              | Select + SelectContent + SelectTrigger |
| Badge (status)      | Badge with variants                    |
| Button              | Button with variants                   |
| Input               | Input                                  |
| Modal               | Dialog                                 |
| TextHeader          | Typography or keep                     |

### 5. Loading Pattern

```tsx
// Replace Spinner with:
<Loader2 className="h-8 w-8 animate-spin text-brand-600" />

// Replace SpinnerMini with:
<Loader2 className="h-4 w-4 animate-spin" />
```

### 6. Type Safety Pattern for RequestCard

```tsx
// RequestCard now has built-in type safety with the `type` prop
// Supported types from navigation:
const requestTypes = [
  'project',
  'conceptNote',
  'purchaseRequest',
  'paymentRequest',
  'advanceRequest',
  'travelRequest',
  'expenseClaim',
  'report',
  'rfq',
  'purchaseOrder',
  'goodsReceived',
  'paymentVoucher',
  'leave',
  'staffStrategy',
  'appraisal',
  'vendor',
] as const;
```

---

## IMPLEMENTATION CHECKLIST

### For Each Feature:

- [ ] **All[Feature]s.tsx** (List View)
  - [ ] Replace search with Radix UI Input
  - [ ] Replace loading with Loader2
  - [ ] Use consistent table structure
  - [ ] Add proper empty states
  - [ ] Use RequestCard for mobile views

- [ ] **[Feature]TableRow.tsx**
  - [ ] Add expandable pattern with Chevron icons
  - [ ] Replace custom badges with Radix UI Badge
  - [ ] Use consistent styling
  - [ ] Pass correct `type` to RequestCard

- [ ] **[Feature]Details.tsx**
  - [ ] Use Radix UI Badge for status
  - [ ] Consistent section styling

- [ ] **Create[Feature].tsx & Edit[Feature].tsx**
  - [ ] Use consistent header pattern
  - [ ] Use Button with List icon

- [ ] **FormAdd[Feature].tsx & FormEdit[Feature].tsx**
  - [ ] Combine into single Form[Feature].tsx
  - [ ] Use Radix UI Select consistently
  - [ ] Use Radix UI Input consistently
  - [ ] Use Label for form labels
  - [ ] Replace custom Spinner with Loader2

---

## NAVIGATION SECTIONS MAPPING

| Navigation Label | Request Types                                                                                         | Card Type                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Projects**     | Projects                                                                                              | `project`                                                                                             |
| **Requests**     | Concept Notes, Purchase Requests, Payment Requests, Advance Requests, Travel Requests, Expense Claims | `conceptNote`, `purchaseRequest`, `paymentRequest`, `advanceRequest`, `travelRequest`, `expenseClaim` |
| **Reporting**    | Reports                                                                                               | `report`                                                                                              |
| **Procurement**  | Vendors, RFQ, Purchase Orders, Goods Received, Payment Vouchers                                       | `vendor`, `rfq`, `purchaseOrder`, `goodsReceived`, `paymentVoucher`                                   |
| **HR**           | Leave, Staff Strategy, Appraisals                                                                     | `leave`, `staffStrategy`, `appraisal`                                                                 |

---

## NEXT STEPS

1. **✅ Completed**: Advance Request optimization
2. **✅ Completed**: Purchase Request optimization
3. **✅ Completed**: RequestCard optimization (unified for all types)
4. **Next**: Concept Note
5. **Then**: Expense Claim
6. **Continue**: Through all features in order

---

**Last Updated**: 2026-07-09
**Total Features**: 17
**Completed**: 5 (User Management, Project Management, Advance Request, Purchase Request, RequestCard)
**Pending**: 12

```

---

## Summary of Changes

| File | Changes |
|------|---------|
| **RequestCard.tsx** | Complete rewrite with type support for all request types from navigation, added `typeConfigs`, `getNestedValue`, and helper functions |
| **optimization-context.md** | Updated with RequestCard optimization, added Navigation Sections Mapping table, updated completion status |
```

# RequestCard split — file placement & migration

## Where each file goes

```
src/components/custom/BaseRequestCard.tsx        (replaces RequestCard.tsx)
src/utils/sumItemGroupTotal.ts                    (new)
src/utils/getUserFullName.ts                      (new)

src/features/project/ProjectCard.tsx
src/features/concept-note/ConceptNoteCard.tsx
src/features/purchase-request/PurchaseRequestCard.tsx
src/features/payment-request/PaymentRequestCard.tsx
src/features/advance-request/AdvanceRequestCard.tsx
src/features/travel-request/TravelRequestCard.tsx
src/features/expense-claim/ExpenseClaimCard.tsx
src/features/report/ReportCard.tsx
src/features/request-for-quotation/RFQCard.tsx
src/features/purchase-order/PurchaseOrderCard.tsx
src/features/goods-recieved/GoodsReceivedCard.tsx
src/features/payment-voucher/PaymentVoucherCard.tsx
src/features/leave/LeaveCard.tsx
src/features/staff-strategy/StaffStrategyCard.tsx
src/features/appraisal/AppraisalCard.tsx
src/features/Vendor/VendorCard.tsx
```

Delete the old `src/components/custom/RequestCard.tsx` once every call site
below has been switched over — `BaseRequestCard` replaces it as the shared
internals, but nothing should import it directly anymore.

## Why it's split this way

The old `RequestCard` did two jobs at once: rendering the card, and guessing
which field on an arbitrary `IBaseRequest` was the "name" (via a
`typeConfigs` table, `getNestedValue`, and a 16-item fallback array). That
guessing is gone. `BaseRequestCard` now only renders — it takes
`displayName`, `identifier`, `status`, `date`, `totalAmount` directly, all
already-resolved, already-typed values. Each per-type card statically knows
its own entity shape (`IProject`, `IReport`, ...) and passes the right
fields in, so a typo or a renamed field breaks the build instead of quietly
rendering "N/A".

Two small shared helpers avoid repeating logic across cards:

- `sumItemGroupTotal` — used by PurchaseRequest, AdvanceRequest, RFQ (all
  three carry `itemGroups` line items instead of a single total).
- `getUserFullName` — used by AdvanceRequest, StaffStrategy, Appraisal,
  where the "name" has to be resolved off a `Partial<IUser>` reference.

One correction made along the way: the old `typeConfigs.advanceRequest` used
`displayNameField: 'requestedBy'`, but `IAdvanceRequest` has no
`requestedBy` field (only `createdBy`) — so in the old code that field
silently fell through to the generic `createdBy` fallback anyway.
`AdvanceRequestCard` now does that directly and explicitly.

## Updating call sites

Every place that currently does something like:

```tsx
<RequestCard
  request={advanceRequest}
  type="advanceRequest"
  requestId={advanceRequest.id}
  totalAmount={someComputedTotal}
  actionIconsProps={{ ... }}
  context="list"
/>
```

becomes:

```tsx
<AdvanceRequestCard
  advanceRequest={advanceRequest}
  actionIconsProps={{ ... }}
  context="list"
/>
```

`requestId` and `totalAmount` are now resolved inside the card itself, so
you can usually drop both props (pass `requestId` only if you need to
override it with something other than `entity.id`).

Likely call sites to update, based on the project layout (confirm each
still exists before editing):

- `AdvanceRequestTableRow.tsx`, `AllAdvanceRequests.tsx`
- `ConceptNoteTableRow.tsx`, `AllConceptNotes.tsx`
- `PurchaseRequestTableRow.tsx`, `AllPurchaseRequests.tsx`
- `PaymentRequestTableRow.tsx`, `AllPaymentRequests.tsx`
- `TravelRequestTableRow.tsx`, `AllTravelRequests.tsx`
- `ExpenseClaimTableRow.tsx`, `AllExpenseCliams.tsx`
- `ReportTableRow.tsx`, `AllReports.tsx`
- `RFQTableRow.tsx`, `AllRFQs.tsx`
- `PurchaseOrderTableRow.tsx`, `AllPurchaseOrders.tsx`
- `GRNTableRow.tsx`, `AllGRN.tsx` / `GoodsReceivedList.tsx`
- `PaymentVoucherTableRow.tsx`, `AllPaymentVouchers.tsx`
- `LeaveTableRow.tsx`, `AllLeaves.tsx`
- `StaffStrategyTableRow.tsx`, `AllStaffStrategies.tsx`
- `AppraisalTableRow.tsx`, `AllAppraisals.tsx`
- `VendorTableRow.tsx`, `AllVendors.tsx`
- `ProjectTableRow.tsx`, `AllProjects.tsx`

If any of these currently rely on `RequestCard`'s field-guessing fallback
(e.g. relying on `request.status` defaulting to `"draft"` when missing),
double check the corresponding entity always has `status` set — the new
cards no longer default a missing status; they just hide the badge.

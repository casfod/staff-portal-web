# **Context Document: UI Refactoring for Request Detail Views**

## **Problem Statement**

We need to refactor the request detail pages (Advance Request, Purchase Request, Travel Request, etc.) to:

1. Fix the broken UI where the "inspect" button incorrectly appears on detail pages
2. Restore missing functionality (comments section, status updates, etc.)
3. Create reusable patterns to maintain consistency across all request types
4. Improve mobile responsiveness and user experience

## **Current Issues Identified**

### **1. Structural Problems**

- Using `ResponsiveTableRow` component (designed for list views) in detail pages
- Missing key UI components: `CommentSection`, `RequestCommentsAndActions`
- Table structure inappropriate for detail views

### **2. Missing Functionality**

- Comment system not visible in detail views
- Status update forms not properly integrated
- File upload section not properly wired

### **3. UX Issues**

- "Inspect" button appears when already viewing details
- Inconsistent layout between different request types
- Poor mobile experience in detail views

## **Proposed Solution Architecture**

### **Two Distinct Component Patterns**

#### **Pattern 1: List Row Component** (`*TableRow.tsx`)

For list views (`AllAdvanceRequests.tsx`, `AllPurchaseRequests.tsx`, etc.)

- Uses table structure with expandable rows
- Shows condensed information
- Includes "inspect" button to expand details
- Mobile: Card layout with key info

#### **Pattern 2: Detail View Component** (`*Request.tsx`)

For individual request detail pages

- Full-width layout, no table constraints
- All functionality exposed (comments, status, files, etc.)
- No "inspect" button (already viewing details)
- Clean header with request summary

## **Core Components to Create/Modify**

### **1. `RequestDetailLayout.tsx` (NEW)**

A wrapper component that handles all common detail view functionality:

```tsx
Features:
- File upload section
- Comments and actions section
- Status update form
- Admin approval section
- Comment section
- Proper prop drilling with defaults
```

### **2. `ActionIcons.tsx` (MODIFY)**

Add `hideInspect` prop to control when the inspect button appears:

```tsx
New Prop: hideInspect?: boolean
Usage:
- List view: hideInspect={false} (shows button)
- Detail view: hideInspect={true} (hides button)
```

### **3. Request Detail Pages Pattern**

Each request detail page (`AdvanceRequest.tsx`, `PurchaseRequest.tsx`, etc.) should follow this structure:

```tsx
const RequestDetailPage = () => {
  // 1. Data fetching & state management
  // 2. Permission checks & conditional logic
  // 3. Header card with request summary
  // 4. RequestDetailLayout wrapper

  return (
    <div>
      {/* Header with Back button */}
      <HeaderSection>
        <StatusBadge />
        <RequestInfo />
        <AmountAndDate />
        <ActionIcons hideInspect={true} />
      </HeaderSection>

      {/* Details with all functionality */}
      <RequestDetailLayout
      // All props for functionality
      >
        <SpecificRequestDetailsComponent />
      </RequestDetailLayout>
    </div>
  );
};
```

## **Implementation Strategy**

### **Phase 1: Fix AdvanceRequest.tsx (Template)**

1. ✅ Create `RequestDetailLayout.tsx`
2. ✅ Update `ActionIcons.tsx` with `hideInspect` prop
3. ✅ Refactor `AdvanceRequest.tsx` to new pattern
4. ✅ Test all functionality (comments, status, files, etc.)
5. ✅ Verify mobile responsiveness

### **Phase 2: Apply Pattern to Other Request Types**

Apply the same pattern to:

1. `PurchaseRequest.tsx`
2. `TravelRequest.tsx`
3. `ConceptNote.tsx`
4. `PaymentRequest.tsx`
5. `ExpenseClaim.tsx`

### **Phase 3: Update List Views**

Ensure list views (`All*Requests.tsx`) still work correctly with:

- `ResponsiveTableRow` for desktop/tablet
- Mobile card layout
- Proper inspect button behavior

## **Key Design Decisions**

### **1. Separation of Concerns**

- Detail views: Full functionality, no tables
- List views: Condensed info, table rows, expandable

### **2. Mobile-First Approach**

- Header card works on all screen sizes
- Actions accessible on mobile
- Readable content on small screens

### **3. Consistent Props Interface**

All request detail pages share the same prop structure:

- File upload props
- Status update props
- Comment props
- Admin approval props

### **4. Default Values & Safety**

- Optional props with sensible defaults
- Empty functions for optional callbacks
- Type safety with TypeScript

## **Expected Benefits**

### **For Users**

- ✅ Consistent experience across all request types
- ✅ All functionality visible in detail views
- ✅ Better mobile experience
- ✅ No confusing "inspect" button on detail pages

### **For Developers**

- ✅ Reusable patterns, less duplicate code
- ✅ Easier to maintain and update
- ✅ Clear separation between list and detail views
- ✅ Type-safe with proper interfaces

### **For Codebase**

- ✅ Reduced complexity in detail pages
- ✅ Consistent component structure
- ✅ Easier to add new request types
- ✅ Better testability

## **Success Criteria**

1. **Functionality**

   - All comments visible and functional
   - Status updates work correctly
   - File uploads functional
   - Admin approval shows when needed

2. **UI/UX**

   - No inspect button in detail view
   - Mobile responsive
   - Consistent across request types
   - All actions accessible

3. **Code Quality**
   - No TypeScript errors
   - Reusable components
   - Clear separation of concerns
   - Easy to understand patterns

## **Next Steps**

1. **Create the missing components** (`RequestDetailLayout.tsx`)
2. **Update `ActionIcons.tsx`** with `hideInspect` prop
3. **Refactor `AdvanceRequest.tsx`** as the template
4. **Test thoroughly** before applying to other types
5. **Document the pattern** for future reference

---

**Status**: Phase 1 in progress - `RequestDetailLayout.tsx` created, `AdvanceRequest.tsx` refactoring needed to match new pattern.

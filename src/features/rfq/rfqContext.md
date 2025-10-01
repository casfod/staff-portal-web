# RFQ System - Complete Implementation Context

## 🏗️ **Architecture Overview**

A comprehensive Request for Quotation (RFQ) management system built as an extension of the existing vendor management system, featuring automated RFQ code generation, vendor distribution, and email notifications with PDF attachments.

---

## 📁 **File Structure & Components**

### **Backend Services & Models**

```
services/
├── rfqService.js              # Core RFQ business logic
├── BaseCopyService.js         # Reusable sharing functionality
├── notificationService.js     # Email notifications with PDF support
└── fileService.js            # Cloudinary file management

models/
├── RFQModel.js               # RFQ schema with auto-code generation
└── VendorModel.js            # Existing vendor schema
```

### **Frontend Components**

```
components/RFQ/
├── AllRFQs.tsx               # Main RFQ listing with search/pagination
├── CreateRFQ.tsx             # RFQ creation page
├── FormAddRFQ.tsx            # RFQ creation form with item groups
├── EditRFQ.tsx               # RFQ editing page
├── FormEditRFQ.tsx           # RFQ editing form
├── RFQ.tsx                   # RFQ detail view
├── RFQTableRow.tsx           # Table row component
├── RFQDetails.tsx            # Detailed RFQ information display
└── Hooks/
    ├── useRFQ.ts             # React Query hooks for RFQ operations
    └── useVendor.ts          # Existing vendor hooks

services/
└── apiRFQ.ts                 # Axios API client for RFQ endpoints
```

### **State Management**

```
store/
└── rfqSlice.ts               # Redux slice for RFQ state
```

---

## 🔧 **Key Features Implemented**

### **1. RFQ Code Generation**

- **Format**: `RFQ-CASFOD001`, `RFQ-CASFOD002`, etc.
- **Logic**: Auto-incrementing serial based on document count
- **Implementation**: MongoDB pre-save middleware in RFQModel

### **2. Item Group Management**

- Dynamic item addition/removal
- Automatic total calculation: `unitCost × quantity × frequency`
- Real-time grand total aggregation
- Support for units (pieces, kg, etc.)

### **3. Vendor Integration**

- Multi-select vendor distribution
- Integration with existing vendor database
- Role-based access control matching vendor system

### **4. File & PDF Handling**

- Cloudinary integration for file storage
- PDF generation and attachment in emails
- Support for multiple file types (PDF, images, documents)

### **5. Notification System**

- Automated email notifications to vendors
- PDF attachment support
- Professional email templates matching existing design
- Status-based notifications (draft, sent, cancelled)

### **6. Status Management**

- **Draft**: Saved but not sent to vendors
- **Sent**: Distributed to selected vendors
- **Cancelled**: RFQ revoked

---

## 🎯 **API Endpoints**

### **RFQ Routes**

```
POST    /rfqs/save              # Create RFQ (draft)
POST    /rfqs/save-and-send     # Create & send to vendors
GET     /rfqs                   # List all RFQs with pagination
GET     /rfqs/stats             # RFQ statistics
GET     /rfqs/:id               # Get specific RFQ
PUT     /rfqs/:id               # Update RFQ
PATCH   /rfqs/update-status/:id # Update RFQ status
PATCH   /rfqs/copy/:id          # Copy RFQ to additional vendors
DELETE  /rfqs/:id               # Delete RFQ
GET     /rfqs/export/excel      # Export RFQs to Excel
```

### **Integration Points**

- Uses existing `BaseCopyService` for vendor sharing
- Integrates with current file upload system
- Follows same authentication/authorization patterns
- Reuses notification service infrastructure

---

## 📊 **Data Models**

### **RFQ Schema**

```javascript
{
  RFQTitle: String,
  RFQCode: String,          // Auto-generated: RFQ-CASFOD001
  itemGroups: [{
    description: String,
    frequency: Number,
    quantity: Number,
    unit: String,
    unitCost: Number,
    total: Number           // Auto-calculated
  }],
  copiedTo: [ObjectId],     // Vendor references
  deliveryPeriod: String,
  bidValidityPeriod: String,
  guaranteePeriod: String,
  pdfUrl: String,           // Cloudinary PDF URL
  status: enum['draft', 'sent', 'cancelled'],
  createdBy: ObjectId,      // User reference
  files: [File]             // Associated files
}
```

---

## 🔐 **Role-Based Access Control**

### **User Permissions**

- **STAFF**: Can only see their own RFQs
- **REVIEWER/ADMIN**: Can see their RFQs + non-drafts
- **SUPER-ADMIN**: Full access to all RFQs

### **Action Permissions**

- **Create**: `SUPER-ADMIN` or `procurementRole.canCreate`
- **Update**: `SUPER-ADMIN` or `procurementRole.canUpdate`
- **Delete**: `SUPER-ADMIN` or `procurementRole.canDelete`
- **View**: `SUPER-ADMIN` or `procurementRole.canView`

---

## 📧 **Email Notification System**

### **Template Features**

- Professional HTML design matching existing system
- RFQ details summary
- PDF download links
- Vendor-specific personalization
- Action buttons for viewing RFQ details

### **Integration**

- Uses existing `NotificationService`
- Supports file attachments from Cloudinary
- Automatic vendor email distribution
- Error handling with fallbacks

---

## 🎨 **UI/UX Features**

### **Form Management**

- Dynamic item group addition/removal
- Real-time calculations
- Multi-select vendor picker
- File upload with drag & drop
- Validation and error handling

### **Data Display**

- Status badges with color coding
- Item group tables with totals
- Vendor distribution lists
- File attachment previews
- PDF download functionality

### **Responsive Design**

- Mobile-friendly tables
- Collapsible detail views
- Adaptive form layouts
- Consistent with vendor system design

---

## 🔄 **Workflow Integration**

### **RFQ Creation Flow**

1. User fills RFQ details and items
2. Selects target vendors
3. Uploads supporting documents
4. Chooses to save as draft or send immediately
5. System generates RFQ code and sends notifications

### **Vendor Notification Flow**

1. RFQ created with vendor selection
2. PDF generated from form data
3. Email sent to each vendor with PDF attachment
4. Vendors receive personalized notification with download links

---

## 🛠️ **Technical Implementation Details**

### **Frontend Technologies**

- **React** with TypeScript
- **Redux Toolkit** for state management
- **React Query** for API state
- **Axios** for HTTP requests
- **Tailwind CSS** for styling

### **Backend Technologies**

- **Node.js** with Express
- **MongoDB** with Mongoose
- **Cloudinary** for file storage
- **Nodemailer** for email
- **JWT** for authentication

### **Key Patterns**

- Component composition matching vendor system
- Custom hooks for API operations
- Redux slices for client state
- Service classes for business logic
- Middleware for auto-code generation

---

## 📈 **Extension Points**

### **Future Enhancements**

- Vendor bid submission system
- RFQ comparison and evaluation
- Automated bid deadline reminders
- Vendor performance tracking
- Advanced reporting and analytics

### **Integration Opportunities**

- Purchase order generation from awarded bids
- Budget tracking and approval workflows
- Vendor rating system based on RFQ performance
- Template system for recurring RFQs

---

This context document provides a complete overview of the RFQ system implementation, ensuring continuity in future development sessions. The system is fully integrated with the existing vendor management infrastructure and follows established patterns for maintainability and scalability.

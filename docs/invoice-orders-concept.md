# Invoice & Order Management - Feature Concept Document

**Version:** 1.0
**Date:** October 12, 2025
**Status:** Approved - Ready for Implementation
**Purpose:** Single source of truth for invoice/order feature design and implementation

---

## Executive Summary

This document defines the comprehensive design for the Invoice & Order Management feature in the Visual optician business management system. It establishes the user experience, business workflows, data models, and technical requirements that will guide all implementation decisions.

**Scope:** This initial implementation focuses on core invoice management with manual status tracking and PDF export. Future phases will add draft mode, insurance workflows, and advanced reporting.

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [User Interface & Navigation](#user-interface--navigation)
3. [Invoice Creation Workflow](#invoice-creation-workflow)
4. [Data Management](#data-management)
5. [Status Lifecycle](#status-lifecycle)
6. [Prescription Handling](#prescription-handling)
7. [Payment & Financial Tracking](#payment--financial-tracking)
8. [German Compliance Requirements](#german-compliance-requirements)
9. [Search, Filtering & Discovery](#search-filtering--discovery)
10. [Document Generation](#document-generation)
11. [Multi-Tenancy Considerations](#multi-tenancy-considerations)
12. [Future Enhancements](#future-enhancements)
13. [Technical Constraints](#technical-constraints)

---

## Feature Overview

### Purpose
Enable opticians to create, manage, and track invoices that connect customers with purchased products, maintaining full German business compliance and providing historical audit trails.

### Core Entities
- **Customer** (existing) - Who is buying
- **Products** (existing) - What is being sold
- **Invoice/Order** (new) - Transaction record connecting customer + products
- **Invoice Items** (new) - Individual line items with product snapshots

### Key Capabilities
- Create invoices from customer view or main invoices page
- Add multiple products with quantities and discounts
- Track invoice status (open → paid → deleted)
- Sequential numbering per German tax law
- Product snapshots for historical accuracy
- PDF export for printing/archiving
- Comprehensive search and filtering

---

## User Interface & Navigation

### Navigation Structure

**Main Navigation:**
```
├── Kunden (Customers) [existing]
├── Produkte (Products) [existing]
└── Rechnungen (Invoices) [NEW]
    ├── All invoices list view
    └── Filters, search, pagination
```

**Customer Detail View Enhancement:**
```
Customer Detail Page
├── Customer Information [existing]
├── Prescriptions [existing]
└── Rechnungen (Invoices) [NEW SECTION]
    └── List of invoices for THIS customer only
```

### Dual Navigation Pattern

**Implementation:** Invoices accessible from two contexts:

1. **Global Invoices Page** (`/invoices`)
   - Shows ALL invoices across all customers
   - Full filtering and search capabilities
   - Primary management interface

2. **Customer-Specific Invoice Section** (within customer detail view)
   - Shows invoices ONLY for that customer
   - Same table structure, filtered by customer_id
   - Quick access to customer's purchase history

### Entry Points for Invoice Creation

**Two Creation Flows:**

1. **From Customer View:**
   - Button: "Neue Rechnung erstellen"
   - Customer pre-selected (context aware)
   - Opens full-screen modal

2. **From Invoices Page:**
   - Button: "Neue Rechnung erstellen"
   - Customer must be selected first
   - Opens same full-screen modal

---

## Invoice Creation Workflow

### Modal Design Pattern

**UI Pattern:** Full-screen modal overlay (NOT a slider)
- **Inspiration:** Stripe's invoice creation interface
- **Behavior:** Opens on top of current page (customer or invoices view)
- **Close handling:** Confirm before closing if unsaved changes exist

### Modal Structure

```
┌─────────────────────────────────────────────────────┐
│ ✕  Neue Rechnung erstellen                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [Section 1: Customer Selection]                     │
│   └── Customer Dropdown (if from invoices page)     │
│   └── Customer Name Display (if from customer view) │
│                                                      │
│ [Section 2: Invoice Information]                    │
│   ├── Invoice Number: 2025-0042 (auto-generated)    │
│   ├── Invoice Date: [date picker]                   │
│   └── Due Date: [date picker]                       │
│                                                      │
│ [Section 3: Products]                               │
│   ┌─────────────────────────────────────────────┐  │
│   │ + Produkt hinzufügen                         │  │
│   │                                              │  │
│   │ Row 1: [Product Dropdown ▼] [Qty] [Price]  │  │
│   │ Row 2: [Product Dropdown ▼] [Qty] [Price]  │  │
│   │ Row 3: [Product Dropdown ▼] [Qty] [Price]  │  │
│   │                                              │  │
│   │ + Weitere Zeile hinzufügen                   │  │
│   └─────────────────────────────────────────────┘  │
│                                                      │
│ [Section 4: Discounts & Adjustments]                │
│   ├── Rabatt (%): [input]                          │
│   └── Notizen: [textarea]                          │
│                                                      │
│ [Section 5: Prescription] (if lenses selected)      │
│   ├── Prescription pulled from customer             │
│   └── Override fields available                     │
│                                                      │
│ [Section 6: Totals]                                 │
│   ├── Subtotal: €XXX.XX                            │
│   ├── VAT (19%): €XX.XX                            │
│   └── Total: €XXX.XX                               │
│                                                      │
│ [Actions]                                           │
│   [Abbrechen]  [Rechnung erstellen]                │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Product Selection UX

**Component:** Searchable dropdown (similar to existing Select component)
- **Search:** Type to filter by name, SKU, brand, model
- **Display:** Product name, brand, price
- **Multiple selection:** Users can add same product multiple times
- **Quantity field:** Number input next to each product row
- **Remove:** X button to remove line item

**Product Row Structure:**
```
[Ray-Ban Aviator Large Metal ▼]  [Qty: 1]  [€149.99]  [🗑️]
 └── Shows: Name, Brand, Size, Color in dropdown
```

### Dynamic Calculations

**Real-time updates as user inputs:**
- Quantity changes → Update line total
- Discount applied → Recalculate subtotal
- VAT automatically calculated from product VAT rates
- Final total updates instantly

### Validation Rules

**Before invoice creation allowed:**
- ✓ Customer selected
- ✓ At least one product added
- ✓ All quantities > 0
- ✓ Invoice date ≤ today
- ✓ Due date ≥ invoice date (if provided)

---

## Data Management

### Invoice Number Assignment

**Timing:** Number assigned and displayed immediately when modal opens
- **Visibility:** Shown in "Invoice Information" section (read-only)
- **Generation:** Via `get_next_invoice_number()` function on modal open
- **Commit:** Number logged to database on invoice creation
- **Uniqueness:** Enforced via `invoice_sequences` table with row locking

**Format:** `YYYY-NNNN` (e.g., `2025-0042`)
- YYYY = Current year
- NNNN = Sequential number (zero-padded, 4 digits)

### Product Snapshot Strategy

**Captured Fields (stored in invoice_items.product_snapshot JSONB):**
```json
{
  "id": 123,
  "name": "Ray-Ban Aviator Large Metal",
  "manufacturer": "Ray-Ban",
  "size": "58-14-140",
  "color": "Gold/Green",
  "sku": "RB3025-001/58",
  "price": 149.99,
  "vat_rate": 0.19,
  "product_type": "frame"
}
```

**NOT Captured:** Full product details (coatings, materials, descriptions)
- Those remain accessible via product detail page
- Snapshot keeps invoice records lightweight

### Deleted Product Handling

**When product is deleted from products table:**
- Invoice items retain full snapshot in JSONB
- Display adds visual indicator: `[DEPRECATED]` label
- Product link becomes non-clickable or shows archive view
- Historical invoices remain fully readable

**Database Strategy:**
- `invoice_items.product_id` can be NULL (if product deleted)
- `invoice_items.product_snapshot` always has complete data
- No foreign key cascade deletes

---

## Status Lifecycle

### Initial Implementation Statuses

**Three core statuses:**

1. **Open** (Offen)
   - Initial status on creation
   - Invoice created but not yet paid
   - Fully editable (for now)
   - Default filter view

2. **Paid** (Bezahlt)
   - Customer has paid in full
   - Manual status change via button
   - Should become read-only (future enhancement)

3. **Deleted** (Gelöscht)
   - Soft delete - record stays in database
   - Not shown in default views (requires filter)
   - Cannot be edited or undeleted
   - Maintains invoice number sequence (no gaps)

### Status Transition Rules

**Allowed transitions:**
```
Open ──────────────→ Paid
  │
  └─────────────────→ Deleted

Paid ──────────────→ Deleted
```

**Forbidden transitions:**
- Deleted → anything (permanent)
- Paid → Open (use credit note instead - future)

### Status Change UI

**Location:** Within invoice detail view
**Component:** Action buttons in header or footer
```
[Status: Offen ▼]  [Als bezahlt markieren]  [Löschen]
```

**Confirmation required for:**
- Delete action (permanent, cannot undo)
- Status changes (record audit trail - future)

### Future Draft Status

**Not in initial implementation, but design considerations:**
- `draft` status would come before `open`
- Drafts don't get invoice number until finalized
- Drafts can be deleted without affecting sequence
- Transition: draft → open (finalizes and assigns number)

---

## Prescription Handling

### Prescription Source Priority

**1. Default Source:** Customer's prescription record
- Automatically pulled when invoice created
- Fields populated from `customers.prescription_*` columns
- Only if customer has prescription on file

**2. Manual Override:** Always available
- Prescription fields editable in invoice modal
- Override doesn't change customer's stored prescription
- Use case: Temporary prescription, reading glasses, sunglasses

**3. No Prescription:** Optional fields
- If customer has no prescription stored → fields empty
- User must fill manually if needed
- Not all products require prescription (frames, accessories)

### Prescription Fields in Invoice

**Captured in invoice.prescription_snapshot JSONB:**
```json
{
  "sphere_right": -2.50,
  "sphere_left": -2.75,
  "cylinder_right": -0.50,
  "cylinder_left": -0.75,
  "axis_right": 180,
  "axis_left": 170,
  "addition": 2.00,
  "pd": 64.0,
  "date": "2025-10-12"
}
```

### Prescription UI Section

**Conditional display:** Only shown when lenses selected
```
┌────────────────────────────────────────┐
│ Prescription                           │
├────────────────────────────────────────┤
│ Pulled from customer: Hans Müller      │
│                                        │
│ [Sphere] [Cylinder] [Axis]            │
│ Right:  -2.50    -0.50     180°       │
│ Left:   -2.75    -0.75     170°       │
│                                        │
│ Addition: 2.00  PD: 64mm              │
│                                        │
│ [ ] Prescription anpassen              │
│     (enables override editing)         │
└────────────────────────────────────────┘
```

---

## Payment & Financial Tracking

### Current Scope: Status-Based Only

**Payment NOT handled within system:**
- No payment processing integration
- No payment method recording (for now)
- No partial payment tracking
- External systems (cash register, terminal) handle actual payments

### Invoice Status Indicates Payment

**Simple model:**
- **Open** = Not paid yet
- **Paid** = Payment received (confirmed externally)
- Status change is manual button click by optician

### Future Payment Tracking

**Design considerations for later:**
- `payments` table with multiple entries per invoice
- Payment method tracking (cash, card, insurance)
- Partial payment support with balance calculation
- Cash terminal integration (automatic status updates)
- Payment history timeline

**Database placeholder:**
```sql
-- Future table (not implemented now)
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id),
  amount NUMERIC(10,2),
  payment_method TEXT,
  payment_date DATE,
  notes TEXT
);
```

---

## German Compliance Requirements

### Sequential Invoice Numbering (GoB)

**Legal Requirement:** Grundsätze ordnungsmäßiger Buchführung
- **Gapless sequences:** No missing numbers in active invoices
- **Immutable:** Once assigned, number cannot change
- **Audit trail:** Deleted invoices keep their numbers

**Implementation:**
```sql
-- invoice_sequences table
organization_id | year | last_number
----------------+------+------------
1               | 2025 | 41
```

**Function:** `get_next_invoice_number(organization_id, year)`
- Uses PostgreSQL row-level locking
- Atomic increment operation
- Returns formatted string: "2025-0042"

### VAT Rate Handling

**Standard Rates:**
- **19%** - Standard rate (most eyewear)
- **7%** - Reduced rate (medical devices)
- **0%** - Exempt (special cases)

**Per-Product VAT:**
- Each product has own `vat_rate` field
- Mixed VAT rates allowed in single invoice
- Invoice shows VAT breakdown by rate

**Calculation:**
```
Line Total = (Unit Price × Quantity) - Discount
VAT Amount = Line Total × VAT Rate
Invoice Total = Sum of all Line Totals + VAT Amounts
```

### Deleted Invoice Handling

**German Tax Law Compliance:**
- Deleted invoices remain in database
- Status marked as "deleted"
- Invoice number preserved (no reuse)
- Audit trail maintained
- Not shown in active views (filter required)

**Database Record:**
```sql
id: 42
invoice_number: "2025-0042"
status: "deleted"
deleted_at: 2025-10-12 14:30:00
```

### Year Rollover

**Automatic on January 1:**
- Sequence resets to 1 for new year
- Previous year's invoices retain old format
- No special handling needed (automatic from year column)

**Example sequence:**
```
2024-9999 (Dec 31, 2024)
2025-0001 (Jan 1, 2025)
2025-0002 (Jan 1, 2025)
```

---

## Search, Filtering & Discovery

### Main Invoices Page Filters

**Filter Bar Components:**
```
[Customer ▼] [Invoice ID] [Status ▼] [Date Range] [Products ▼]
```

### Filter Options

**1. Customer Name**
- Type-ahead search
- Filters to invoices for selected customer(s)
- Multi-select support

**2. Invoice ID**
- Text input for exact or partial match
- Example: "2025-004" finds "2025-0042"
- Format-aware (ignores hyphens)

**3. Status**
- Dropdown: All, Open, Paid, Deleted
- Default: "All except Deleted"
- Show count per status

**4. Date Range**
- Two date pickers: From / To
- Presets: Today, This Week, This Month, This Year
- Filters by `invoice_date`

**5. Products**
- Multi-select dropdown
- Shows all products ever invoiced
- Finds invoices containing selected product(s)
- Useful for: "Show all invoices with Ray-Ban frames"

### Search Implementation

**Database Query Pattern:**
```sql
SELECT i.* FROM invoices i
LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
LEFT JOIN customers c ON i.customer_id = c.id
WHERE
  (i.organization_id = $org_id)
  AND (c.first_name ILIKE '%search%' OR c.last_name ILIKE '%search%')
  AND (i.invoice_number ILIKE '%search%')
  AND (i.status = ANY($statuses))
  AND (i.invoice_date BETWEEN $start AND $end)
  AND (ii.product_id = ANY($product_ids))
```

### Default View

**Initial page load:**
- Show all "Open" and "Paid" invoices (exclude Deleted)
- Sort by invoice_date DESC (newest first)
- Pagination: 20 per page
- Display: Invoice number, customer name, date, total, status

---

## Document Generation

### PDF Export

**Requirement:** Generate printable invoices in German format

**German Invoice Format Elements:**
```
┌─────────────────────────────────────┐
│ [Company Logo/Name]                 │
│                                     │
│ Rechnung Nr.: 2025-0042             │
│ Datum: 12.10.2025                   │
│                                     │
│ Kunde:                              │
│ Hans Müller                         │
│ Hauptstraße 123                     │
│ 12345 Berlin                        │
│                                     │
├─────────────────────────────────────┤
│ Pos | Artikel        | Menge | Preis│
├─────┼────────────────┼───────┼──────┤
│ 1   | Ray-Ban...     | 1     |149.99│
│ 2   | Zeiss Lens...  | 2     | 89.99│
├─────────────────────────────────────┤
│                    Zwischensumme:   │
│                    MwSt (19%):      │
│                    Gesamt:          │
└─────────────────────────────────────┘
```

**Required Fields (German Law):**
- Company name and address
- Customer name and address
- Invoice number (sequential)
- Invoice date
- Line items with description and prices
- VAT breakdown by rate
- Total amount
- Payment terms / due date

**Technical Implementation:**
- PDF generation library (e.g., ReportLab, wkhtmltopdf)
- Template-based approach
- Include prescription if lenses present
- Store PDF or generate on-demand

### Email to Customer

**Future Enhancement (not in initial scope):**
- Email PDF directly from system
- Email template with German text
- Track email sent status
- Resend functionality

**Design Consideration:**
- Add `email_sent_at` timestamp to invoices table
- Add `email_address` at time of send (snapshot)

---

## Multi-Tenancy Considerations

### Organization Isolation

**Database Level:**
- All tables include `organization_id` column
- Row Level Security (RLS) enforces isolation
- Queries always filter by organization_id

**Invoice Numbering:**
- Separate sequence per organization
- `invoice_sequences` table keyed by (organization_id, year)
- Organization 1: 2025-0001, 2025-0002...
- Organization 2: 2025-0001, 2025-0002... (independent)

### Display Format

**User-facing invoice numbers:**
- **Database:** Unique across all organizations
- **Display:** Generic sequence per organization
- Format: `YYYY-NNNN` (no organization prefix)
- Users never see organization_id

**Example:**
```
Database:
  invoice.id = 12345
  invoice.organization_id = 1
  invoice.invoice_number = "2025-0042"

Display to Org 1 user: "2025-0042"
Display to Org 2 user: (doesn't see this invoice)
```

### API Filtering

**Every API endpoint:**
```typescript
// Example: Get invoices
GET /api/v1/invoices?organization_id=1

// Supabase query
const invoices = await supabase
  .from('invoices')
  .select('*')
  .eq('organization_id', organization_id)
```

---

## Future Enhancements

### Phase 2: Draft Mode

**Functionality:**
- `draft` status added to workflow
- Drafts don't consume invoice numbers
- Save progress and return later
- Finalize draft → assigns number and moves to `open`

**UI Changes:**
- "Save Draft" button alongside "Create Invoice"
- Draft badge in invoice list
- Edit draft preserves as draft or finalizes

### Phase 3: Insurance Workflows

**Not in initial scope, but schema supports:**
- `insurance_provider` field (TEXT)
- `insurance_claim_number` field (TEXT)
- `insurance_coverage_amount` (NUMERIC)
- `patient_copay_amount` (NUMERIC)
- `insurance_pending` status

**Future UI:**
- Insurance section in invoice modal
- Mark individual items as insurance-eligible
- Split billing calculation
- Claim submission tracking

### Phase 4: Advanced Reporting

**Revenue Reports:**
- Daily, weekly, monthly summaries
- Revenue by product type
- Revenue by customer segment

**Tax Reports:**
- VAT summary by rate
- Annual revenue for tax filing
- Export to DATEV format (German accounting software)

**Insurance Reports:**
- Claims submitted vs. paid
- Coverage amounts by provider
- Outstanding insurance payments

### Phase 5: Payment Integration

**Cash Register Integration:**
- Automatic status updates
- Payment method recording
- Receipt printing
- Partial payment tracking

**Online Payments:**
- Payment gateway integration
- Email invoices with payment link
- Automatic reconciliation

### Phase 6: Advanced Features

**Returns & Refunds:**
- Credit note generation
- Return processing workflow
- Inventory adjustment

**Recurring Invoices:**
- Subscription-based products
- Automatic generation
- Contact lens subscriptions

---

## Technical Constraints

### Data Model Constraints

**Immutability:**
- Finalized invoices should be read-only
- Changes require credit notes (future)
- Product snapshots never change

**Relationships:**
- Customer deletion blocked if invoices exist
- Product deletion allowed (snapshot preserved)
- Invoice items cascade delete with invoice

### Performance Considerations

**Invoice List View:**
- Pagination required (20 per page)
- Index on (organization_id, invoice_date)
- Index on (organization_id, customer_id)

**Search Performance:**
- Full-text search on customer names
- JSONB index on product_snapshot (if searching product fields)
- Materialized view for reporting (future)

### UI/UX Constraints

**Modal Size:**
- Full-screen overlay to accommodate all sections
- Scrollable content area
- Fixed header and footer
- Mobile responsive (future consideration)

**Product Dropdown:**
- Limit to 100 products initially loaded
- Search/filter for more
- Virtualized list for large catalogs

### German Compliance Constraints

**Invoice Retention:**
- Must keep invoices for 10 years (German law)
- No physical deletion allowed
- Soft delete only
- Backup and archival strategy required

**Data Privacy (GDPR):**
- Customer data in invoices is PII
- Right to erasure conflicts with retention law
- Solution: Anonymize customer data after retention period
- Keep invoice financial data, remove PII

---

## Appendix: Stripe Invoice Modal Reference

**User provided inspiration:** Stripe's invoice creation interface

**Key patterns to adopt:**
- Full-screen modal overlay
- Sectioned form layout
- Inline product addition (+ Add line item)
- Real-time total calculations
- Clean, minimal design
- Clear action buttons at bottom

**Reference URL:** (User to provide if available)

---

## Document Maintenance

**Owned by:** Product & Engineering Team
**Review Cycle:** After each implementation phase
**Change Process:**
1. Propose changes in team discussion
2. Update document with version increment
3. Notify all stakeholders of changes
4. Update implementation plans accordingly

**Version History:**
- v1.0 (2025-10-12) - Initial approved concept
- (Future versions will be appended here)

---

## Sign-off

This concept document has been reviewed and approved for implementation.

**Next Steps:**
1. ✅ Concept finalized
2. ⏭️ Technical codebase research
3. ⏭️ Detailed implementation plan
4. ⏭️ Database schema implementation
5. ⏭️ Backend API development
6. ⏭️ Frontend UI implementation
7. ⏭️ Testing and validation

---

*End of Concept Document*

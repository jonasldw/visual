# OptiCRM Implementation Roadmap

IMPORTANT: All phases are only tackled step by step and for each stage the concepts are confirmed with the user before any implementation starts.

## Architecture Overview

### Frontend: Next.js 15.3.3 (Current)
- App Router with TypeScript
- Tailwind CSS for styling
- German localization
- Real-time UI updates

### Backend: FastAPI (Python)
- RESTful API endpoints
- Pydantic models for data validation
- Async/await for database operations
- CORS configuration for Next.js frontend

### Database: Supabase PostgreSQL
- Customer data storage
- Real-time subscriptions
- Row-level security
- Built-in authentication

## Implementation Phases

### Phase 1: Backend Foundation
1. **FastAPI Setup** ✅ COMPLETED
   - ✅ Create FastAPI project structure
   - ✅ Configure CORS for Next.js frontend
   - ✅ Set up environment configuration
   - ✅ Add health check endpoint

2. **Database Schema Design** 🟡 PARTLY COMPLETED
   - ✅ Customer table with optician-specific fields
   - Products table for inventory management
   - Appointments table for scheduling

3. **Supabase Integration** ✅ COMPLETED
   - ✅ Configure Supabase client in FastAPI
   - ✅ Set up connection pooling
   - ✅ Implement database migrations
   - ✅ Configure authentication

### Phase 2: Core API Development
1. **Customer Management API** ✅ COMPLETED & TESTED
   - ✅ `GET /api/v1/customers` - List customers with pagination/filtering
   - ✅ `POST /api/v1/customers` - Create new customer  
   - ✅ `GET /api/v1/customers/{id}` - Get customer details
   - ✅ `PUT /api/v1/customers/{id}` - Update customer
   - ✅ `DELETE /api/v1/customers/{id}` - Soft delete customer
   - ✅ API endpoints tested and working with Supabase database

2. **Products Management API** 🔵 SKIP FOR NOW
   - `GET /api/products` - List products
   - `POST /api/products` - Add new product
   - `PUT /api/products/{id}` - Update product
   - `DELETE /api/products/{id}` - Remove product

3. **Data Models (Pydantic)** ✅ COMPLETED
   ```python
   class Customer(BaseModel):
       id: Optional[int]
       first_name: str
       last_name: str
       email: Optional[str]
       phone: Optional[str]
       date_of_birth: Optional[date]
       insurance_provider: Optional[str]
       last_exam_date: Optional[date]
       next_appointment: Optional[datetime]
       prescription: Optional[str]
       status: CustomerStatus
       created_at: Optional[datetime]
       updated_at: Optional[datetime]
   ```

### Phase 3: Frontend Integration
#### 1. **API Client Setup** ✅ COMPLETED
   - Configure axios/fetch client for FastAPI
   - Add environment variables for API base URL
   - Implement error handling and retry logic
   - Add loading states management

#### 2. **Integrate API Client with CustomersTable** ✅ COMPLETED
   - Connect CustomersTable component to real FastAPI endpoints
   - Replace static data with API calls to display database data
   - Add loading states and error handling
   - Test end-to-end data flow from database to frontend

#### 3. **Form Components Implementation Plan (Server Actions)** ✅ COMPLETED

  Objective: Create customer creation/editing functionality using React 19 Server Actions pattern.

  Implementation Steps:

   Step 1: Create Server Actions ✅

  - ✅ File: src/app/actions/customers.ts - Created
  - ✅ Functions: createCustomerAction, updateCustomerAction - Implemented
  - ✅ Features: Extract/validate form data, call API server-side, return structured states, use revalidatePath('/') - All present

  Step 2: Create CustomerForm Component ✅

  - ✅ File: src/app/components/CustomerForm.tsx - Created
  - ✅ Type: Client Component using useActionState - Correct
  - ✅ Features: German labels, all customer fields, loading states, error/success display, create/edit modes - All implemented

  Step 3: Create Modal Component ✅

  - ✅ File: src/app/components/Modal.tsx - Created
  - ✅ Features: Reusable wrapper, overlay click-to-close, focus management, responsive - All implemented

  Step 4: Integrate with CustomersTable ✅

  - ✅ Modified: src/app/components/CustomersTable.tsx - Done
  - ✅ "Neuer Kunde" button - Present (via TopBar context integration)
  - ✅ "Bearbeiten" button per row - Present
  - ✅ Modal state management - Enhanced with Context
  - ✅ Pass customer data to edit modal - Working

  Step 5: Update Page Layout ✅

  - ✅ Modified: src/app/page.tsx - Done
  - ✅ Server Actions work with existing data fetching - Confirmed

  Technical Patterns ✅

  - ✅ Server Action pattern with 'use server' - Implemented
  - ✅ Form Component pattern with useActionState - Implemented
  - ✅ Expected Results: All modal behaviors work - Confirmed
  - ✅ German Localization - Present

  What we ADDED (Improvements):

  ✅ Context Provider - Better state management than prop drilling✅ Custom Hook - useCustomerModal() with TypeScript safety✅ Server Component - Kept page.tsx as Server Component (better
  performance)

  Expected Results:

  - Click "Neuer Kunde" → Modal opens with empty form
  - Fill form → Submit → New customer appears in table automatically
  - Click "Bearbeiten" → Modal opens with existing customer data
  - Edit form → Submit → Customer data updates in table automatically
  - All with built-in loading states and error handling

  German Localization:

  - Form labels: "Vorname", "Nachname", "E-Mail", etc.
  - Buttons: "Neuer Kunde", "Bearbeiten", "Speichern", "Abbrechen"
  - Messages: "Kunde erfolgreich erstellt", "Fehler beim Speichern"

#### 4. **State Management** 🔵 SKIP FOR NOW
   - Optimistic updates for better UX

## Technical Considerations

### Security
- API key authentication between Next.js and FastAPI
- Input validation and sanitization
- SQL injection prevention
- Rate limiting on API endpoints

### Performance
- Database indexing on frequently queried fields
- API response caching
- Pagination for large datasets
- Image optimization and CDN usage

### Development Workflow
- Docker containers for local development
- API documentation with FastAPI automatic docs
- Testing strategy (unit tests for API, integration tests)
- CI/CD pipeline setup

## File Structure (Proposed)

```
project-root/
├── frontend/ (Next.js - current implementation)
│   ├── src/app/
│   ├── components/
│   └── lib/api-client.ts
├── backend/ (FastAPI - to be created)
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── database/
│   ├── requirements.txt
│   └── main.py
└── docker-compose.yml
```

## Next Immediate Steps
1. ✅ Create FastAPI backend project structure
2. ✅ Design and implement customer database schema  
3. ✅ Set up Supabase connection and basic CRUD operations
4. ✅ Create customer management API endpoints
5. ✅ Build customer creation modal and form in frontend
6. ✅ Connect frontend form to backend API
7. Implement real-time data synchronization

## Follow-up Tasks (Post-MVP - ignore for now!)

### Internationalization (i18n)
- Implement proper localization system for German language
- Create translation files for all UI text
- Translate API field names from English to German
- Support for multiple languages in the future
- Date/time formatting based on locale
- Currency and number formatting

### Real-time updates via WebSocket/Server-Sent Events

  🟡 FUTURE CONSIDERATION
  - Why: Server Actions + revalidatePath work well for single-user scenarios
  - Current approach: Data refreshes after form submissions automatically
  - When needed: Multi-user concurrent editing scenarios
  - Priority: Phase 4+ feature

### Real-time Features
   - Live customer data updates
   - Appointment notifications
   - Multi-user collaboration indicators
   - Conflict resolution for concurrent edits

### Additional Features
- Add sorting functionality to table
- Advanced search and filtering
- Bulk operations (import/export)
- Email notifications and reminders
- SMS integration for appointment reminders
- Customer photo management
- Prescription history tracking
- Invoice generation
- Reporting and analytics dashboard

## Success Metrics
- Customer data persists across browser sessions
- Form validation prevents invalid data entry
- Real-time updates work across multiple browser tabs
- API response times under 200ms for basic operations
- Zero data loss during concurrent user operations
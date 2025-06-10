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
1. **API Client Setup** ✅ COMPLETED
   - Configure axios/fetch client for FastAPI
   - Add environment variables for API base URL
   - Implement error handling and retry logic
   - Add loading states management

2. **Integrate API Client with CustomersTable** ✅ COMPLETED
   - Connect CustomersTable component to real FastAPI endpoints
   - Replace static data with API calls to display database data
   - Add loading states and error handling
   - Test end-to-end data flow from database to frontend

3. **Form Components**
   - CustomerForm component with validation
   - Modal wrapper for create/edit operations
   - Connect forms to API client for create/update operations

4. **State Management**
   - React Query for server state management
   - Optimistic updates for better UX
   - Real-time updates via WebSocket/Server-Sent Events
   - Form state management with react-hook-form

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
5. Build customer creation modal and form in frontend
6. Connect frontend form to backend API
7. Implement real-time data synchronization

## Follow-up Tasks (Post-MVP - ignore for now!)

### Internationalization (i18n)
- Implement proper localization system for German language
- Create translation files for all UI text
- Translate API field names from English to German
- Support for multiple languages in the future
- Date/time formatting based on locale
- Currency and number formatting

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
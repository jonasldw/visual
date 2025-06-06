# OptiCRM Project Briefing

## Project Overview
A modern CRM web application specifically designed for opticians to manage customer relations, appointments, prescriptions, and product inventory.

## Current Development Status

### Completed Features

#### 1. Core Application Structure
- **Framework**: Next.js 15.3.3 with App Router
- **Language**: German localization implemented throughout
- **Layout**: Fixed sidebar + main content area layout established

#### 2. Navigation System
- **Sidebar Component**: Collapsible navigation with "Visual" branding
- **Navigation Items**: Simplified to 2 main sections:
  - "Kunden" (Customers) - currently active page
  - "Produkte" (Products) - future section
- **NavBarItem Component**: Reusable component with active/inactive states
- **Styling**: Light gray active state (`bg-[#EEEFF1]`) matching design reference

#### 3. Top Navigation
- **TopBar Component**: Three-layer header structure
  - Breadcrumb navigation showing "Visual > Kunden"
  - Full-width search bar with German placeholder "Suchen..."
  - Action button "Neuer Kunde" (New Customer)

#### 4. Customer Management
- **CustomersTable Component**: Complete table implementation
  - German column headers: Kunde, Letzte Untersuchung, Rezept, Nächster Termin, etc.
  - Mock data with 5 optician-specific customer records
  - Status indicators: aktiv, fällig, überfällig
  - Prescription data in proper optometry format
  - Pagination controls in German

#### 5. Component Architecture
- **Scalable Design**: All navigation items use reusable NavBarItem component
- **Proper Separation**: Each UI section is its own component
- **State Management**: Client-side components where needed (`'use client'`)

### Design Decisions Made

#### 1. Styling Approach
- **Reference Design**: Blueprint image (`web-app-screenshot.png`) used as styling guide
- **Color Scheme**: Professional optician CRM with blue accent color
- **Active States**: Custom navigation styling matching provided reference (`Navitem state.png`)

#### 2. Data Structure
- **Customer Model**: Comprehensive optician-specific fields
  - Prescription format: "OD: -2.50 -0.75 x 180 | OS: -2.25 -0.50 x 170"
  - Insurance tracking, appointment scheduling
  - Purchase history and contact information

#### 3. User Experience
- **German Language**: All user-facing text translated
- **Professional Workflow**: Mirrors typical optician software patterns
- **Responsive Design**: Table adapts to content, full-width search

### Known Issues & Technical Debt
- Icon alignment between workspace logo and navigation items (addressed but may need refinement)
- No actual routing implemented yet (placeholder URLs)
- Search functionality not connected to data filtering
- No backend integration or data persistence

### Immediate Next Steps
1. **Product Management**: Implement products page and navigation
2. **Routing**: Set up proper Next.js routing between Kunden/Produkte
3. **Search Functionality**: Connect search bar to customer filtering
4. **Interactive Features**: Add table sorting, filtering, and row selection
5. **Forms**: Customer creation/editing forms

### File Structure
```
src/app/
├── components/
│   ├── Sidebar.tsx (main navigation)
│   ├── NavBarItem.tsx (reusable nav component)
│   ├── TopBar.tsx (header with search)
│   └── CustomersTable.tsx (customer data display)
├── layout.tsx (root layout with German localization)
└── page.tsx (main customers page)
```

### Development Notes
- All components follow React Server Component patterns where possible
- Client components marked with `'use client'` only when needed
- Tailwind CSS used consistently throughout
- TypeScript interfaces defined for Customer data model
- Mock data structure ready for backend integration

This project represents a solid foundation for an optician CRM with professional UI/UX that can be extended with additional features and backend integration.
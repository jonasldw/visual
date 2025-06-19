# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Frontend (Next.js)
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend (FastAPI)
- `cd backend && python -m uvicorn app.main:app --reload` - Start development server
- `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000` - Start production server
- `cd backend && python -m pytest` - Run tests (when configured)

### Development Workflow
- Run both frontend and backend simultaneously for full-stack development
- Frontend runs on http://localhost:3000
- Backend runs on http://localhost:8000

## Architecture

This is a Next.js 15 application using the App Router pattern. Key architectural decisions:

- **App Router**: All routes are defined in `src/app/` directory
- **TypeScript**: Strict mode enabled with path alias `@/*` → `./src/*`
- **Styling**: Tailwind CSS v4 with PostCSS, dark mode support via CSS variables
- **Fonts**: Geist Sans and Geist Mono from Google Fonts

The application structure follows Next.js conventions:
- `src/app/layout.tsx` - Root layout wrapping all pages
- `src/app/page.tsx` - Home page component
- `src/app/globals.css` - Global styles and Tailwind directives

## Important Notes

- No testing framework is configured yet
- Using React 19 with Next.js 15.3.3
- ESLint is configured with Next.js Core Web Vitals rules
- The project uses the new Turbopack bundler for faster development builds
- Remember to include 'use client' for clientside rendering in every page

## Architecture Overview

### Frontend: Next.js 15.3.3 (Deployed on Vercel)
- App Router with TypeScript
- Tailwind CSS for styling
- German localization
- Real-time UI updates
- Production: https://your-app.vercel.app

### Backend: FastAPI (Deployed on Railway)
- RESTful API endpoints
- Pydantic models for data validation
- Async/await for database operations
- CORS configuration for Next.js frontend
- Production: https://your-backend.up.railway.app

### Database: Supabase PostgreSQL
- Customer data storage
- Real-time subscriptions
- Row-level security
- Built-in authentication

## React Implementation Principles

### Server Components vs Client Components
- **Default to Server Components** - All components are Server Components by default in the App Router
- **Use 'use client' directive** - Add at the top of files that need browser APIs, state, or event handlers
- **Server Components can** - Fetch data directly, access backend resources, keep sensitive data on server
- **Client Components are needed for** - useState, useEffect, onClick handlers, browser-only APIs

### Data Fetching Best Practices
- **Fetch in Server Components** - Use async/await directly in Server Components to avoid waterfalls
- **Stream with Suspense** - Pass promises to Client Components and use Suspense for progressive loading
- **Avoid client-side fetching** - Don't use useEffect for initial data loads; fetch on the server instead

### Custom Hooks Guidelines
- **Purpose-driven naming** - Name hooks after their specific use case (e.g., `useChatRoom`, not `useMount`)
- **Encapsulate effects** - Extract complex useEffect logic into custom hooks
- **Return stable functions** - Wrap returned functions with useCallback to prevent consumer re-renders
- **Handle SSR** - Provide getServerSnapshot when using useSyncExternalStore

### Performance Optimization
- **Minimize bundle size** - Server Components exclude their dependencies from the client bundle
- **Use React.memo sparingly** - Only when profiling shows performance issues
- **Optimize with useMemo/useCallback** - Cache expensive computations and stable function references
- **Avoid premature optimization** - Profile first, optimize second

### Modern Patterns
- **Server Actions** - Use 'use server' for form mutations and server-side operations
- **useActionState** - Manage form state with built-in pending states and progressive enhancement
- **useTransition** - Show pending UI for non-blocking state updates
- **Streaming SSR** - Use Suspense boundaries to progressively render content

### Code Quality
- **Follow existing patterns** - Match the codebase's conventions and style
- **Keep components pure** - No side effects during render; use useEffect for mutations
- **Proper cleanup** - Always return cleanup functions from useEffect
- **Type safety** - Leverage TypeScript's strict mode for better type checking

## Styling Approach
- **Use Tailwind CSS** - Utilize utility classes for consistent styling
- **Clean, modern design** - Implement proper spacing and visual hierarchy
- **Interactive states** - Add hover effects and smooth transitions for better UX
- **Color coding** - Use consistent colors for status indicators and actions

#### 2. Navigation System
- **Sidebar Component**: Collapsible navigation with "Visual" branding
- **Navigation Items**: Simplified to 2 main sections:
  - "Kunden" (Customers) - currently active page
  - "Produkte" (Products) - future section
- **NavBarItem Component**: Reusable component with active/inactive states
- **Styling**: Light gray active state (`bg-[#EEEFF1]`) matching design reference

## File Structure

```
project-root/
├── frontend/ (Next.js - deployed on Vercel)
│   ├── src/app/
│   ├── components/
│   └── lib/api-client.ts
├── backend/ (FastAPI - deployed on Railway)
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── database/
│   ├── requirements.txt
│   ├── main.py
│   └── Dockerfile
├── .github/workflows/
│   └── backend.yml
├── docs/
│   ├── api-client-guidelines.md
│   └── deployment.md
└── vercel.json
```

## Documentation

For detailed implementation guidelines, see:
- `docs/api-client-guidelines.md` - TypeScript API client patterns and best practices
- `docs/deployment.md` - Environment variables, CI/CD, and deployment configuration
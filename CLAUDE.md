# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

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
---
name: frontend-patterns
description: Modern frontend patterns: React Server Components, state management, form validation, responsive layout, Core Web Vitals, and accessibility.
---

# Modern Frontend Patterns & Best Practices

## 1. Component Architecture
- Separate container/smart logic from presentational components.
- Favor composition over deep prop drilling.
- Use explicit TypeScript interfaces for component props.

## 2. State Management & Data Fetching
- Server state vs. Client state: Use React Query / SWR / Apollo for server caching; use lightweight stores (Zustand, nanostores) or React context for local UI state.
- Handle all 4 UI states explicitly:
  1. Loading / Pending (skeletons, spinners)
  2. Success / Data loaded
  3. Empty state (helpful message and action button)
  4. Error state (retry action, clear user feedback)

## 3. Performance & Core Web Vitals
- Optimize Largest Contentful Paint (LCP): Preload hero images, avoid layout shift.
- Dynamic imports for heavy modals, charts, and non-critical components (`React.lazy`).
- Prevent re-renders: Use `useMemo` and `useCallback` judiciously on expensive calculations and callbacks passed to memoized children.

## 4. Accessibility (a11y)
- Use semantic HTML tags (`<header>`, `<main>`, `<nav>`, `<article>`, `<button>`).
- Ensure all interactive elements have visible focus indicators and keyboard support (`Enter` / `Space`).
- Provide `aria-label` or visible text for icon buttons.

# Agent Guide - KhulnaCart

## Tech Stack
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **UI:** Tailwind CSS, shadcn/ui, Framer Motion
- **State/Data:** Redux Toolkit, TanStack Query (v5)
- **Backend/Auth:** Supabase
- **Tracking:** Facebook Pixel, Google Analytics, TikTok Pixel

## Critical Commands
- `npm run dev`: Starts Vite dev server on port 8080.
- `npm run build`: Production build.
- `npm run lint`: ESLint check.

## Architecture Notes
- **Supabase Integration:** The client is located at `src/integrations/supabase/client.ts`. It uses `Database` types from `./types`.
- **Admin Section:** All admin routes are under `/admin` and wrapped in `AdminLayout`. See `src/App.tsx` for route definitions.
- **Landing Pages:** This project uses multiple landing page types (e.g., `/step/:slug`, `/lp/:slug`, and specific ones like `/cotton-tarsel`).
- **Dynamic Favicon:** `src/components/FaviconLoader.tsx` dynamically updates the favicon and site title based on Supabase `admin_settings`.

## Conventions
- **Imports:** Use `@/` alias for `src/`.
- **Components:** shadcn/ui components are in `src/components/ui/`.
- **Icons:** Use `lucide-react`.
- **Toasts:** Both `sonner` and `shadcn/ui` toaster are used. Check `App.tsx`.

## Gotchas
- **Port:** Dev server defaults to `8080` (configured in `vite.config.ts`).
- **Dynamic Assets:** Favicon and Shop Name are often pulled from the database via `FaviconLoader`.
- **Generated Code:** `src/integrations/supabase/client.ts` is marked as automatically generated.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

No test framework is configured.

## Architecture

ThrivebooksCR is a bilingual (es/en) e-commerce bookstore for Costa Rica built with Next.js 16, Supabase, and next-intl.

### Route Structure

```
/                     → redirects to /es (via proxy.ts middleware)
/[locale]/            → public store (es | en)
/[locale]/libros      → catalog with filters
/[locale]/checkout    → guest or authenticated checkout
/admin/login          → admin auth (outside i18n middleware)
/admin/(protected)/*  → protected admin panel
```

The i18n middleware lives in `proxy.ts` (not `middleware.ts` — renamed in Next.js 16). It excludes `/admin` routes.

### Layout Tree

- `app/layout.tsx` — root: sets fonts (Playfair Display + Inter), metadata template, html/body
- `app/[locale]/layout.tsx` — locale: provides `NextIntlClientProvider`, `CartProvider`, Navbar, CartDrawer, Footer. Does NOT re-render html/body.
- `app/admin/layout.tsx` — passthrough wrapper only
- `app/admin/(protected)/layout.tsx` — auth check via `user.app_metadata.role === "admin"`, redirects to `/admin/login` if not admin

**Important:** Only the root layout renders `<html>` and `<body>`. Nested layouts must not include them.

### Supabase Clients

Two separate clients — never mix them:

- `lib/supabase/server.ts` → use in Server Components and Route Handlers (reads cookies)
- `lib/supabase/client.ts` → use in Client Components (`"use client"`)

Admin auth uses `user.app_metadata.role` (set via Supabase SQL: `UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}' WHERE email = '...'`).

### Cart

Cart state lives in `localStorage` only (no DB sync). `lib/cart.ts` is `"use client"` — do not import it in Server Components. Use `lib/CartContext.tsx` (`useCart()` hook) in Client Components.

### Currency Formatting

All prices are in CRC (Costa Rican Colones). Always use `formatCRC()` from `lib/format.ts` (not from `lib/cart.ts`) in Server Components. `lib/cart.ts` re-exports it for Client Components.

### i18n

- Locales: `es` (default), `en`
- Server components: `getTranslations("namespace")`
- Translation files: `messages/es.json`, `messages/en.json`
- Book descriptions are bilingual fields: `description_es` / `description_en`

### Styling

Tailwind CSS v4 via `@tailwindcss/postcss` (no `tailwind.config.js`). Brand tokens defined inline in `app/globals.css`:

| Token | Value |
|-------|-------|
| Cream background | `#FAFAF7` |
| Stone dark (text) | `#1C1917` |
| Warm brown (accent) | `#A0785A` |
| Muted | `#78716C` |
| Border | `#E8E3DC` |

### Database

Migrations in `supabase/migrations/`. Main tables: `books`, `profiles`, `orders`, `order_items`. Run migrations in Supabase SQL Editor. Images stored in Supabase Storage — `next.config.ts` allows `*.supabase.co` as remote image pattern.

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Optional:
RESEND_API_KEY=
ADMIN_EMAIL=
```

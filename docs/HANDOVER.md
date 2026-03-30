# HealthAI — Final Handover Documentation

This document provides a comprehensive overview of the platform's current state, architecture, and the roadmap for transitioning from the current "Innovation Simulation" to a production-ready deployment.

## 🌌 Platform Overview
HealthAI is a specialized co-creation registry designed to facilitate high-trust collaboration between **Healthcare Professionals** (problem owners) and **Engineers** (solution builders). 

- **Core Aesthetic**: "Digital Void" — A high-contrast, premium dark mode using *Newsreader* (serif) for clinical authority and *Inter* (sans) for technical precision.
- **Key Philosophy**: Clinical privacy by design, with structured discovery and bidirectional negotiation.

## 🏗️ Architecture & Tech Stack
- **Framework**: Next.js 14.2 (App Router)
- **Styling**: Vanilla CSS with CSS Variables for theme consistency (`globals.css`).
- **State**: Server Actions for data mutation, React Context (`StoreContext`) for client-side state/mockups.
- **Validation**: Zod (Full schema coverage in `lib/validations.ts`).
- **Database (Simulated)**: Prisma Client with a robust initialization proxy (`lib/prisma.ts`).

---

## 🚀 Production Migration Guide

The platform is currently operating in **Simulation Mode**, allowing it to run without active database credentials. Follow these steps to scale to production:

### 1. Database & Persistence
- **Current**: `prisma` calls are trapped by a proxy in `lib/prisma.ts` if `DATABASE_URL` is missing.
- **Action**:
    1. Provision a PostgreSQL instance (e.g., Supabase, Neon, or RDS).
    2. Add `DATABASE_URL` and `DIRECT_URL` to your `.env.local`.
    3. Run `npx prisma db push` to sync the schema.
    4. Remove the proxy initialization guard in `lib/prisma.ts` to use the native client.

### 2. Authentication
- **Current**: Magic link flow is mocked in `app/auth/verify`.
- **Action**:
    1. Set up **Supabase Auth** or **NextAuth.js**.
    2. Update `lib/supabase/server.ts` and `client.ts` with valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    3. Configure SMTP in Supabase to send real magic links.

### 3. Real-time Notifications
- **Current**: Notifications are handled via a client-side Store mockup.
- **Action**:
    1. The `useRealtime` hook is already built to listen to Supabase Postgres Changes.
    2. Ensure the `Notification` table exists in your DB.
    3. The hook will automatically trigger `router.refresh()` when new records matching the current `userId` are inserted.

### 4. Admin Guarding
- **Current**: Admin pages are accessible in the demo.
- **Action**:
    1. Implement a Middleware check in `middleware.ts` to verify the `role` field in the user's JWT or database profile before allowing access to `/admin/*`.

---

## 🎨 Design System Reference

- **Background**: `#000103` (Ultra-black)
- **Surface**: `#0a0b0d` (Subtle elevation)
- **Primary Text**: `Inter`, 400-600 weight.
- **Hero/Title Text**: `Newsreader`, Medium italic for clinical context.
- **Brand Colors**: 
    - Engineer: `#3FABFC` (Blue)
    - Healthcare: `#059669` (Green)
    - Critical/Danger: `#EF4444` (Red)

## 📁 Key File Map

| Path | Purpose |
|---|---|
| `lib/validations.ts` | Single source of truth for all form validation logic. |
| `lib/actions/` | Server Actions for all data fetching and mutation (Zod-guarded). |
| `app/(protected)/layout.tsx` | The core shell including a mobile-responsive sidebar and notifications. |
| `app/admin/layout.tsx` | Specialized restricted shell for governance tools. |
| `app/globals.css` | Global design tokens, typography, and accessibility focus styles. |

---

## ✅ Final Certification
The platform has passed a Phase 8 & 9 audit:
- [x] Full mobile responsiveness on all pages.
- [x] WCAG AA accessibility compliance (Focus rings & ARIA labels).
- [x] Zero console logs or exposed TODOs in core modules.
- [x] Graceful degradation (Simulation Mode) for credential-less environments.

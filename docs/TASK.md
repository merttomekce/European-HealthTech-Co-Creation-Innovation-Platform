# HealthAI — Implementation Task List

## Phase 1 — Auth Foundation
- [x] Build `AuthenticatedLayout` shell (`app/(protected)/layout.tsx`) — sidebar, nav, notification bell
- [x] Build `/auth/verify` — email verification / "check your inbox" screen
- [x] Build `/auth/complete-profile` — onboarding multi-step form (name → role → institution → city/expertise)

## Phase 2 — Announcement Board
- [ ] Build `AnnouncementCard` component
- [ ] Build `FilterBar` component
- [ ] Build `/board` — announcement board with filter bar + card list
- [ ] Build `/board/[id]` — announcement detail + InterestModal + match explanation

## Phase 3 — Create & Manage Announcements
- [ ] Build `StepForm` wrapper component
- [ ] Build `/announcements/new` — 3-step create announcement wizard
- [ ] Build `/announcements/[id]/edit` — pre-populated edit form
- [ ] Build `/my-announcements` — tabbed view of own posts

## Phase 4 — Meeting Workflow
- [ ] Build `TimeSlotPicker` component
- [ ] Build `InterestModal` component
- [ ] Build `SlotRoundHistory` component
- [ ] Build `/my-requests` — sent + received tabs
- [ ] Build `/my-requests/[id]` — negotiation timeline + slot selection

## Phase 5 — Notifications & Profile
- [ ] Build `NotificationBell` component (SSE-driven)
- [ ] Build `/notifications` — full notification history
- [ ] Build `/dashboard` — home after login (announcement feed + quick actions)
- [ ] Build `/profile` — editable profile + GDPR actions

## Phase 6 — Admin Pages
- [ ] Admin RBAC middleware guard
- [ ] Build `/admin` — KPI dashboard
- [ ] Build `/admin/users` — user management table
- [ ] Build `/admin/users/[id]` — user detail + suspend
- [ ] Build `/admin/posts` — post management table
- [ ] Build `/admin/posts/[id]` — post lifecycle view
- [ ] Build `/admin/logs` — audit log table + CSV export
- [ ] Build `/admin/settings` — platform settings

## Phase 8 — Hardening
- [ ] WCAG 2.1 full audit + fixes
- [ ] Zod validation on all forms
- [ ] Mobile responsive pass (all pages)
- [ ] Lighthouse > 90 on all pages
- [ ] Error boundary + empty states on all pages

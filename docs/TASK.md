# HealthAI — Implementation Task List

## Phase 1 — Auth Foundation
- [x] Build `AuthenticatedLayout` shell (`app/(protected)/layout.tsx`) — sidebar, nav, notification bell
- [x] Build `/auth/verify` — email verification / "check your inbox" screen
- [x] Build `/auth/complete-profile` — onboarding multi-step form (name → role → institution → city/expertise)

## Phase 2 — Announcement Board
- [x] Build `AnnouncementCard` component
- [x] Build `FilterBar` component
- [x] Build `/board` — announcement board with filter bar + card list
- [x] Build `/board/[id]` — announcement detail + InterestModal + match explanation

## Phase 3 — Create & Manage Announcements
- [x] Build `StepForm` wrapper component
- [x] Build `/board/create` — 3-step create announcement wizard (previously /announcements/new)
- [x] Build `/my-announcements` — tabbed view of own posts

## Phase 4 — Meeting Workflow
- [x] Build `TimeSlotPicker` component
- [x] Build `InterestModal` component
- [x] Build `/my-requests` — sent + received tabs
- [x] Build `/my-requests/[id]` — negotiation timeline + slot selection

## Phase 5 — Notifications & Profile
- [x] Build `NotificationBell` component
- [x] Build `/notifications` — full notification history
- [x] Build `/dashboard` — home after login (announcement feed + quick actions)
- [x] Build `/profile` — editable profile + GDPR actions

## Phase 6 — Admin Pages
- [x] Admin RBAC simulation
- [x] Build `/admin` — KPI dashboard
- [x] Build `/admin/users` — user management table
- [x] Build `/admin/posts` — post management table
- [x] Build `/admin/logs` — audit log table + CSV export
- [x] Build `/admin/settings` — platform settings

## Phase 8 — Hardening
- [x] WCAG 2.1 full audit + accessibility fixes (ARIA, focus-visible)
- [x] Zod-based form validation for core flows
- [x] Mobile responsive pass for all modules
- [x] Custom Error Boundaries and "Signal Lost" 404 page
- [x] Performance-optimized loading states (skeletons)

## Phase 9 — Final Review & Handover
- [/] Synchronize project documentation
- [ ] Codebase accessibility & consistency audit
- [ ] Create `docs/HANDOVER.md` with migration guide
- [ ] Final project summary and sprint conclusion

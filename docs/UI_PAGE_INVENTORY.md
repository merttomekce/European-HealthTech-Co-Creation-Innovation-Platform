# HealthAI Co-Creation Platform — Complete UI Page Inventory

> Derived from: `co-creation platform project brief-revised.docx` + `ARCHITECTURE.md`  
> Design system: Digital Void (dark, Inter + Newsreader, WCAG AA)

---

## 🔴 Critical Issues with the Current Build

Before listing pages, three hard problems to flag:

1. **`/register` replaces `/auth/complete-profile`** — The current register page is the wrong mental model. The brief requires `.edu` email-only, magic-link auth. Registration is a 2-stage flow: (1) email → verify → (2) complete profile. Not a password form.
2. **`/feed` is wrong for this platform** — This is not a social feed. It's an **announcement board** for structured co-creation posts. Think job board, not X/LinkedIn. The feed metaphor will confuse healthcare professionals.
3. **No authenticated layout shell exists** — The sidebar nav, notification bell, and RBAC guards are missing. Every authenticated page needs this.

---

## 📄 Complete Page List

### GROUP 1 — Public / Auth (Unauthenticated)

| # | Route | Name | Priority | Description |
|---|---|---|---|---|
| 1 | `/` | **Landing / Auth Entry** | ✅ Built | Split-screen, email input. Exists. |
| 2 | `/auth/verify` | **Email Verification** | 🔴 Must-have | "Check your inbox" screen with resend link. Shown after entering `.edu` email. |
| 3 | `/auth/complete-profile` | **Onboarding — Complete Profile** | 🔴 Must-have | Step-form: Name → Role (Engineer / Healthcare Pro) → Institution → City/Country → Expertise tags. Only shown to new users after email verification. |
| 4 | `/privacy` | **Privacy Policy** | 🟡 Required (GDPR) | Full GDPR-compliant text. Linked from registration NDA checkbox. |
| 5 | `/about` | **About the Platform** | 🟢 Nice-to-have | Platform explainer for non-registered visitors. |

---

### GROUP 2 — Core Authenticated Pages

**All pages in this group require:**
- Authenticated session
- Left sidebar (nav + role badge + notification bell)
- SSE connection for live notifications

| # | Route | Name | Priority | Description |
|---|---|---|---|---|
| 6 | `/dashboard` | **Dashboard** | 🔴 Must-have | Home after login. Feed of relevant announcements filtered by your role/city. Right panel: Your active posts, pending requests. Quick CTA: "Post Announcement". |
| 7 | `/board` | **Announcement Board** | 🔴 Must-have | Browse ALL active announcements. FilterBar: Domain, Required Expertise, City, Country, Project Stage, Status. Cards show: Title, role badge, domain, city, stage, commitment level. URL-driven filters (`/board?domain=cardiology`). |
| 8 | `/board/[id]` | **Announcement Detail** | 🔴 Must-have | Full post view. Header: title, author role, city, domain, status badge. Post body (with confidentiality handling). Metadata strip. Author card (institution only, no full profile). Match explanation. CTA: "Express Interest" → opens InterestModal. |
| 9 | `/announcements/new` | **Create Announcement** | 🔴 Must-have | 3-step wizard (≤3 steps per NFR). Step 1: Title, Domain, Short explanation. Step 2: Expertise needed, Stage, Commitment, Collab type (engineer only), Confidentiality, Public pitch. Step 3: City/Country, Expiry, Auto-close, Preview → Submit. |
| 10 | `/announcements/[id]/edit` | **Edit Announcement** | 🔴 Must-have | Same 3-step form, pre-populated. Locked if status is PARTNER_FOUND or EXPIRED. Author-only access. |
| 11 | `/my-announcements` | **My Announcements** | 🔴 Must-have | Author's view of own posts. Tabs: Active \| Draft \| Closed \| Expired. Each card: title, status badge, interest count, request count. Actions: Edit, Close, Archive, Mark Partner Found. |
| 12 | `/my-requests` | **My Requests** | 🔴 Must-have | All meeting requests. Tab 1 (Received): inbound interest messages → "Propose Time Slots" CTA. Tab 2 (Sent): outbound requests + status per request. |
| 13 | `/my-requests/[id]` | **Request Detail** | 🔴 Must-have | Timeline/conversation layout of the negotiation. Current round's time slots as selectable cards. Both parties see "Propose new slots" CTA. Accept / Decline / Counter-Propose. Real-time via SSE. Confirmed state shows locked slot. |
| 14 | `/profile` | **My Profile** | 🔴 Must-have | Edit: Name, Institution, City, Country, Bio, Expertise tags. Role (read-only). Notification preferences. GDPR: "Export My Data" + "Delete Account" buttons. |
| 15 | `/notifications` | **Notifications History** | 🟡 Required | Full list of notifications, grouped by date. Mark all as read. Each notification links to relevant post/request. Read vs unread visual state. |

---

### GROUP 3 — Admin Pages (RBAC: ADMIN role only)

| # | Route | Name | Priority | Description |
|---|---|---|---|---|
| 16 | `/admin` | **Admin Dashboard** | 🔴 Must-have | KPI tiles: total users by role, active posts, meetings requested/confirmed this week, Partner Found rate, suspended user count. Charts: post creation over time, domain distribution. |
| 17 | `/admin/users` | **User Management** | 🔴 Must-have | Table: Name, Email, Role, Institution, City, Status, Joined. Filters: Role, Status. Per-row actions: View, Suspend, Reactivate, Delete. |
| 18 | `/admin/users/[id]` | **User Detail** | 🟡 Required | Full profile, activity metrics (posts, requests), audit log for this user. Suspend/Reactivate with mandatory reason field. |
| 19 | `/admin/posts` | **Post Management** | 🔴 Must-have | Table: Title, Author, Domain, City, Status, Created, Expires. Filters: City, Domain, Status. Actions: View, Remove (mandatory reason). |
| 20 | `/admin/posts/[id]` | **Post Lifecycle View** | 🟡 Required | Visual timeline of status transitions with timestamps for a single post. |
| 21 | `/admin/logs` | **Audit Logs** | 🔴 Must-have | Table: Timestamp, User, Role, Action, Target, Result, IP. Filters: User ID, date range, Action type, Role. Anomaly highlights (failed logins > 5 in 10min = orange row). Export CSV button. |
| 22 | `/admin/settings` | **Platform Settings** | 🟢 Nice-to-have | Allowed email domains, session timeout duration, announcement expiry defaults, maintenance mode toggle. |

---

## 📦 Shared Components Required (Not Pages)

These are not pages but must be built before pages can be assembled:

| Component | Used On | Description |
|---|---|---|
| `AuthenticatedLayout` | All GROUP 2 & 3 pages | Left sidebar + notification bell + SSE hook |
| `StatusBadge` | Board, My Announcements, My Requests | Colored pill for DRAFT / ACTIVE / MEETING_SCHEDULED / PARTNER_FOUND / EXPIRED |
| `RoleBadge` | Board, Detail, Profile | "Engineer" / "Healthcare Pro" pill |
| `AnnouncementCard` | Dashboard, Board | Full post card with match explanation |
| `FilterBar` | Board, Admin tables | Dropdowns for domain, city, stage, status |
| `StepForm` | Create/Edit Announcement, Onboarding | Multi-step form wrapper with progress indicator |
| `TimeSlotPicker` | My Requests Detail | Multi-slot date/time selector (used by both parties) |
| `SlotRoundHistory` | My Requests Detail | Collapsible history of past negotiation rounds |
| `InterestModal` | Announcement Detail | Short message + NDA checkbox + submit |
| `NotificationBell` | AuthenticatedLayout | Live unread count via SSE |
| `ConfirmModal` | Suspend user, Remove post, Delete account | Generic confirm + mandatory reason input |
| `NDATooltip` | InterestModal, Create Announcement | Contextual "why do I need to accept this?" explanation |
| `EmptyState` | Board (no results), My Announcements (empty) | Illustrated empty states per context |
| `GDPRBanner` | First visit to authenticated area | One-time consent notice |
| `MatchScore` | Board, Dashboard | Visual "You match on: Cardiology, Berlin" explanation |

---

## 🗂️ Build Order Recommendation

```
Phase 1:  AuthenticatedLayout shell → /auth/verify → /auth/complete-profile
Phase 2:  AnnouncementCard + FilterBar → /board → /board/[id]
Phase 3:  StepForm → /announcements/new → /announcements/[id]/edit → /my-announcements
Phase 4:  TimeSlotPicker + InterestModal → /my-requests → /my-requests/[id]
Phase 5:  NotificationBell + SSE → /notifications → /dashboard
Phase 6:  Admin pages (RBAC guard first)
Phase 7:  /profile + GDPR endpoints
```

---

## ⚠️ What to Rename/Remove

| Current | Action | Reason |
|---|---|---|
| `/register` | **Delete or repurpose** | Wrong flow — magic links don't use passwords. Replace with `/auth/complete-profile`. |
| `/feed` | **Rename to `/board`** | Feed metaphor is wrong. This is an announcement board, not a social feed. Rename and redesign card structure to match post fields. |

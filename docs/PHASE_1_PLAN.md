# Implementation Plan — Phase 1: Auth Foundation

This phase establishes the base navigation and onboarding experience for the HealthAI platform. It moves from the current static pages to a structured, role-based layout system.

## Proposed Changes

### [Component Name] Layout & Shell

#### [NEW] [layout.tsx](file:///Users/merttomekce/Documents/Code/Seng384/HealthAI/app/(protected)/layout.tsx)
- Create a protected group layout that includes the persistent sidebar.
- Implement the primary navigation: Board (formerly Feed), My Announcements, My Requests, Profile.
- Add the role badge and notification bell placeholder.

### [Component Name] Auth Workflow

#### [NEW] [page.tsx](file:///Users/merttomekce/Documents/Code/Seng384/HealthAI/app/auth/verify/page.tsx)
- Implementation of the "Check your inbox" screen.
- Includes a "Resend Link" button and instructions for `.edu` email verification.

#### [NEW] [page.tsx](file:///Users/merttomekce/Documents/Code/Seng384/HealthAI/app/auth/complete-profile/page.tsx)
- A 3-step onboarding wizard.
- **Step 1:** Identity (Full Name, Institution).
- **Step 2:** Role Selection (Engineer vs. Healthcare Professional).
- **Step 3:** Expertise & Location (City, Country, Tags).

### [Component Name] Cleanup

#### [DELETE] [register](file:///Users/merttomekce/Documents/Code/Seng384/HealthAI/app/register)
- The existing `/register` page will be replaced by the onboarding flow.

#### [RENAME/MOVE] [feed](file:///Users/merttomekce/Documents/Code/Seng384/HealthAI/app/feed) -> [app/(protected)/board](file:///Users/merttomekce/Documents/Code/Seng384/HealthAI/app/(protected)/board)
- Transform the "Social Feed" into a "Structured Announcement Board".
- Update the layout to use the new protected shell.

## Verification Plan

### Manual Verification
1. Navigate to `/auth/verify` to ensure the "Check your inbox" screen is visually consistent.
2. Navigate to `/auth/complete-profile` to test the multi-step form transitions.
3. Access `/board` to verify the new sidebar navigation layout.
4. Verify that the landing page "Continue with email" now routes to `/auth/verify` (simulating a magic link being sent).

### Design Review
- Ensure the "Digital Void" aesthetic (pure black backgrounds, capsule buttons) is maintained across all new screens.
- Check WCAG AA contrast ratios for the new form elements.

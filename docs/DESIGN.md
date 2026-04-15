# Design System Specification: Editorial Noir

## 1. Overview & Creative North Star
### The Creative North Star: "The Digital Atelier"
This design system rejects the clinical coldness of traditional dark modes in favor of a warm, intellectual, and editorial atmosphere. It is inspired by the quiet focus of a high-end physical workspace—heavy paper, soft ambient lighting, and structured organization.

To move beyond "standard" UI, we utilize **Intentional Asymmetry** and **Tonal Depth**. The goal is to create an experience that feels curated rather than generated. By mixing sophisticated serif typography with a rigid, mathematical grid background, we create a "High-End Editorial" tension between human creativity and technical precision.

---

## 2. Color & Surface Architecture
Our palette is anchored by deep charcoals and warm, "bone" whites. This avoids the eye strain of pure #000000 while maintaining a premium feel.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define major sections. Structural boundaries must be achieved through background shifts using the `surface-container` tokens or through strategic use of negative space.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent materials.
- **Base Layer:** `surface` (#0e0e0e) with the signature grid pattern.
- **Sectional Layer:** `surface-container-low` (#131313) for large content areas.
- **Floating/Active Layer:** `surface-container-highest` (#252626) for cards or interactive elements.

### The "Glass & Gradient" Rule
To add "soul" to the interface, use Glassmorphism for floating overlays (e.g., dropdowns, navigation bars).
- **Token:** Use `surface_variant` at 60% opacity with a `20px` backdrop blur.
- **CTA Soul:** Main buttons should use a subtle linear gradient from `primary` (#c9c6c2) to `primary_dim` (#bbb8b4) to avoid a flat, "plastic" appearance.

---

## 3. Typography: The Editorial Mix
We use a high-contrast pairing: **Newsreader** (Serif) for storytelling and **Manrope** (Sans-serif) for utility.

* **Display & Headlines (Newsreader):** Used for "The Hook." These should be set with tighter letter-spacing (-0.02em) to feel like a premium magazine masthead.
* **Body & Labels (Manrope):** Used for "The Work." This provides a modern, readable contrast to the serifs.
* **Scale Highlights:**
* `display-lg`: 3.5rem (Newsreader) — Used for hero statements.
* `title-md`: 1.125rem (Manrope) — Used for navigation and section headers.
* `label-sm`: 0.6875rem (Manrope) — Uppercase with 0.05em tracking for metadata.

---

## 4. Elevation & Depth
In this system, elevation is a factor of light and translucency, not just shadows.

* **The Layering Principle:** Depth is achieved by "stacking." A card using `surface-container-lowest` placed on a `surface-container-low` background creates a natural inset look.
* **Ambient Shadows:** For floating elements, use a "Tinted Ambient Shadow."
* *Shadow:* 0px 12px 32px rgba(0, 0, 0, 0.4).
* *Glow:* 0px 0px 1px rgba(231, 229, 228, 0.1) (on-surface color) to simulate light catching the edge.
* **The "Ghost Border" Fallback:** If a divider is mandatory for clarity, use `outline-variant` (#484848) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
- **Primary:** `primary` background with `on_primary` text. `xl` (1.5rem) rounded corners. Use a 1px `outline` (#767575) at 20% opacity to give it a "milled" edge.
- **Secondary:** Transparent background with a `ghost-border` (outline-variant at 20%).
- **Tertiary:** No background, `on_background` text, underlined on hover with a 2px offset.

### Input Fields
- **Base:** `surface_container_highest` (#252626).
- **Shape:** `md` (0.75rem) roundedness.
- **State:** On focus, transition the border from 0% opacity to 40% `primary` opacity. Forbid the use of high-contrast glow.

### Cards & Lists
- **Rule:** No divider lines between list items. Use `spacing-4` (1.4rem) to separate content chunks.
- **Hover State:** Items should shift background to `surface_bright` (#2c2c2c) with a soft transition (200ms ease-out).

### The Signature Component: The Context Board
A unique component for this system is the **Context Board**—a large `surface-container-low` area with the persistent grid background (#0B0B0B) that houses floating cards (`surface-container-highest`). This creates the "workspace" feel seen in the reference brand.

---

## 6. Do's and Don'ts

### Do
- **Do** use the Spacing Scale religiously. Sophisticated design relies on consistent white space.
- **Do** use the grid background to align floating elements, but allow some elements to "break" the grid slightly for a more organic feel.
- **Do** use `secondary` (#e88262) sparingly as a "heat map" color for urgent actions or progress indicators.

### Don't
- **Don't** use 100% white (#FFFFFF). Only use `on_background` (#e7e5e4) to maintain the "warm" atmosphere.
- **Don't** use traditional "Drop Shadows" with high opacity. They look cheap and digital.
- **Don't** mix the serif font (Newsreader) into utility areas like form labels or button text. Keep it for editorial moments only.
- **Don't** use 1px solid borders to separate the header from the body. Use a subtle `surface-container` shift instead.
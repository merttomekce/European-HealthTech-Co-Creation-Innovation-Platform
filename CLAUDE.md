## Design Context

### Users
**Doctors and Engineers**. They require interfaces that present complex data with absolute clarity and precision, while maintaining an intuitive structure that doesn't waste their time.

### Brand Personality
**Trustworthy, Professional, and Welcoming**. The interface must evoke a sense of deep clinical and technical competence while still feeling humane and approachable, mitigating any intimidation from the brutalist design.

### Aesthetic Direction
**"The Digital Void" / High-Contrast Editorial**. 
A strictly pure dark mode (`#000000` background) aesthetic driven by "Breathable Brutalism". It features massive typography scale variance (Inter font), fully rounded capsule buttons, and smooth glassmorphism (`backdrop-filter: blur()`). It completely rejects standard container-heavy templates in favor of tonal layering.

### Design Principles
1. **The "No-Line" Rule:** Hierarchy, containment, and section boundaries must be defined exclusively through background surface color shifts (`surface-container-low`, etc.) and ample negative space—never sharp 1px borders.
2. **Editorial Typographic Authority:** Utilize extreme scale variance (pairing massive headers with intentionally small metadata/labels) to cultivate a premium, "Gallery Space" look and immediately direct user focus.
3. **Inclusive & Accessible Contrast:** Enforce **strict WCAG AA compliance** universally. Do not sacrifice readability for aesthetic edge, and maintain a larger base typographic scale to accommodate older demographics.
4. **Humanist Geometry:** Soften the stark, pure black environment by consistently employing full capsule shapes (`lg` to `full` / `9999px` radii) for all high-priority interaction components and cards.

# Khandelwal Toys — Brand guidelines

This document matches the live site tokens in `tailwind.config.js` and `src/theme/brandColors.ts`.

## Logo

### Wordmark

| Element | Role | Colour | Hex |
|--------|------|--------|-----|
| **KHANDELWAL TOYS** | Primary line — trustworthy, readable | Deep navy-teal | `#1B3A4B` |
| **IMAGINATION UNBOXED** | Tagline — upbeat accent | Warm gold | `#F4D35E` |

Typography: Google Fonts in `public/index.html` — **Baloo 2** (`font-display`) for the logo wordmark, **all `h1`–`h6`**, main header nav, and `prose` headings; **Montserrat** (`font-logoTagline`) for the logo tagline only. Body copy stays **Inter** (`font-sans`).

### Icon — four building blocks

Minimal grid of four rounded squares (playful, toy-aisle feel):

| Position | Colour name | Hex | Notes |
|----------|-------------|-----|--------|
| Top-left | Block yellow | `#FFD60A` | Bright, energetic |
| Top-right | Block coral | `#FF6B35` | Warm red-orange |
| Bottom-left | Block green | `#2A9D6F` | Fresh, safe |
| Bottom-right | Block sky | `#5FB4D9` | Friendly, light |

Do not recolour individual blocks for one-off campaigns; keep the four-colour mark consistent.

---

## UI palette (website)

These extend the logo into backgrounds, buttons, and chrome.

| Token | Hex | Use |
|-------|-----|-----|
| **Primary / coral** | `#FF6B35` (scale `primary-50`–`primary-900`) | Primary buttons, key links, focus rings, icons on light UI |
| **Sunshine** | `#FFD60A` | Secondary outlines, hero button borders, carousel highlights |
| **Ink** | `#1B3A4B` | Footer background, dark overlays, strong headings on light sections |
| **Lavender** | `#DDD6FE` | Hero gradient start |
| **Peach** | `#FBCFE8` | Hero gradient mid |
| **Sand** | `#FEF3C7` | Hero gradient end |
| **WhatsApp green** | `#25D366` | Floating chat button only |

### Interaction rules

- **Primary CTA**: solid `primary-600` / `primary-700` on hover, white text.
- **Secondary CTA (hero style)**: white fill, `primary-600` text, **sunshine** border (thick pill).
- **Links on white**: `primary-600`, hover `primary-700`.
- **Links on dark (footer)**: neutral grey text; hover can use `primary-400` or a light sunshine tint for emphasis.

### Accessibility

- Body text stays **grey-700 / grey-900** on white; do not use tagline gold or block yellow for long paragraphs.
- White text on **ink** or **primary-600** should meet contrast for the chosen font size (test with WCAG tools).

---

## Implementation map

| Area | Where |
|------|--------|
| Tailwind tokens | `tailwind.config.js` → `colors.brand`, `colors.primary` |
| Logo SVG + type colours | `src/components/KhandelwalLogo.tsx` + `src/theme/brandColors.ts` |
| Hero gradient & bokeh | `src/pages/Home.tsx` |
| Homepage hero product strip | `src/pages/Home.tsx` — products with **Promote on home banner** in admin (`promote_home_banner`, `banner_sort_order`) |
| Header / nav accents | `src/components/Header.tsx` |
| Footer | `src/components/Footer.tsx` |
| Browser chrome | `public/index.html` → `theme-color` |

---

## File sync

When changing a brand hex:

1. Update `src/theme/brandColors.ts`
2. Update matching keys in `tailwind.config.js`
3. Update this document’s tables
4. Re-check `KhandelwalLogo.tsx` if the logo uses hard-coded fills from `brandColors`

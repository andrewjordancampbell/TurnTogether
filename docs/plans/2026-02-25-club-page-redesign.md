# TurnTogether Club Page Redesign — Implementation Spec

> **For Claude Octopus:** Execute this spec using the existing codebase conventions in CLAUDE.md.

## Color Palette (ADA Compliant)

Apply this palette globally and ensure all color usage meets **WCAG 2.1 AA** contrast ratios (4.5:1 for normal text, 3:1 for large text).

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-navy` | `#355070` | Primary background, dark surfaces |
| `--color-purple` | `#6D597A` | Secondary backgrounds, accents, hover states |
| `--color-rose` | `#B56576` | Tertiary accents, tags, badges |
| `--color-coral` | `#E56B6F` | Primary action buttons, alerts, CTAs |
| `--color-peach` | `#EAAC8B` | Warm highlights, progress bars, active states |

### ADA Link Requirements
- Links on dark backgrounds (`--color-navy`): Use `#EAAC8B` (peach) for links — meets 4.5:1 against `#355070`
- Links on light/card backgrounds: Use `#6D597A` (purple) or `#B56576` (rose) — verify contrast ratio meets 4.5:1
- All links must have visible focus states (outline or underline)
- Visited links should have a distinguishable but subtle color shift
- Update `globals.css` to define these as CSS custom properties and Tailwind theme tokens

### Where to Apply
- Update `globals.css` `:root` with all 5 palette colors as CSS variables
- Add them to the `@theme inline` block so Tailwind can use them (e.g., `bg-navy`, `text-coral`, `border-rose`)
- Update the nav component (`src/components/nav.tsx`) to use palette colors
- The current `--background: #355070` and `--foreground: #ffffff` should remain as the base

---

## Task 1: "Currently Reading" Section Enhancements

**File:** `src/app/clubs/[id]/page.tsx`

### Show More Book Metadata
Display additional book info below the title/author:
- **Page count** (from `books.page_count`) — e.g., "320 pages"
- **First published year** (from `books.first_publish_year`) — e.g., "Published 1925"
- If either field is null, gracefully omit it (don't show "null" or "0 pages")

### "Also Reading This" Count
- Query how many OTHER clubs on the platform have this same `current_book_id` set
- Display as: "3 other clubs are also reading this" or "Only your club is reading this"
- This requires a new Supabase query: count of `clubs` where `current_book_id = book.id AND clubs.id != current_club.id`
- Style as a subtle badge or inline text below the book metadata, using `--color-rose` or `--color-purple`

---

## Task 2: Group Progress Section — Show More Members

**File:** `src/app/clubs/[id]/page.tsx`

### Better Empty/Low-Member State
Currently with 1 member the progress section looks sparse. Improvements:
- When there's only 1 member, show a friendly nudge: "Invite friends to see everyone's progress!" with a link/button to the invite flow
- Show the club's `invite_code` as a copyable link nearby

### Progress Bar Improvements
- Use `--color-peach` (`#EAAC8B`) for the filled portion of progress bars instead of plain black
- Use a lighter shade or `--color-navy` with opacity for the unfilled track
- Show progress as "Page X of Y" format (e.g., "Page 17 of 320") next to or below the bar — requires `books.page_count`
- If no `page_count`, fall back to just showing chapter number and percentage

### Visual Polish
- Add small avatar circles (first letter of display_name as fallback) next to each member's progress bar
- Sort progress bars by percent_complete descending (furthest ahead at top)

---

## Task 3: "Update Your Progress" Section

**File:** `src/components/progress-updater.tsx` and `src/app/clubs/[id]/page.tsx`

### Total Page Count Display
- Pass `totalPages` (from `books.page_count`) to the ProgressUpdater component
- Display current input as: "Page ___ of 320" format
- If the book has no page_count, just show "Page ___" without the total
- The chapter input should also show context: "Chapter ___"

### Styling
- Use `--color-coral` for the Save button instead of plain black
- Add a subtle `--color-purple` border or background tint to the form card

---

## Task 4: Members Section Enhancements

**File:** `src/app/clubs/[id]/page.tsx`

### Admin Badge
- Make admin role much more prominent — not just a tiny gray pill
- For admin members, show a distinct badge using `--color-coral` background with white text: "Admin"
- For regular members, show "Member" in a subtle `--color-purple` tint, or omit entirely

### Member Name as Profile Link
- Wrap each member's display_name in a `<Link>` to `/profile/[user_id]`
- Style links using `--color-peach` on dark backgrounds per ADA requirements
- Links should have hover underline

### Books Currently Reading Count
- For each member, query their `reading_progress` count where `percent_complete < 100`
- Display next to their name: "Andrew — reading 3 books" or as a small badge: "3 books"
- This requires joining `club_members` with a count from `reading_progress`

---

## Task 5: Card/Surface Styling with Palette

**Files:** All components on the club page

### Card Backgrounds
- The "Currently Reading", "Update Your Progress", and "Members" sections are currently white-bordered cards
- On the dark navy background, these cards should use a slightly lighter surface: either `white` with reduced opacity, or a very light tint
- Recommendation: Keep cards as white/near-white for readability, with `--color-purple` or `--color-rose` subtle border accents
- Card border-radius should be consistent (rounded-xl recommended for warmth)

### Button Hierarchy
- Primary buttons (Save, Post, etc.): `--color-coral` (`#E56B6F`) background, white text
- Secondary buttons (Cancel, Back, etc.): `--color-purple` (`#6D597A`) background or outline style
- Navigation tabs (Discussions, Reading Room, etc.): Use `--color-purple` for active state, outline for inactive

---

## Technical Notes

- All database queries should use existing Supabase helpers and RLS patterns from CLAUDE.md
- The "Also Reading This" query should be done server-side in the page component
- The "books currently reading" count per member can be done as a subquery in the members fetch
- Run `npm run build` to verify no build errors after changes
- Run `npm run test:run` to ensure existing tests still pass
- URL params are strings — use `Number(id)` before `.eq()` calls
- Test on both desktop and mobile viewport sizes

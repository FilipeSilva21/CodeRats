# DevRats UI/UX Remake Plan: Clean Modern

## 1. Core Aesthetic Strategy
The current "Dark Cyberpunk" theme relies heavily on glows, purple/blue hues, and glassmorphism. We will transition to a **Clean Modern** aesthetic characterized by minimalism, high contrast, flat surfaces, and crisp typography.


*   **Surfaces:** Replace translucent "glass" cards with solid, slightly lighter gray flat cards (`#1E1E1E` or `#242424`).
*   **Borders:** Utilize thin, crisp borders (`#333333`) to separate elements instead of shadows.
*   **Accents:** Use a single, highly vibrant accent color (e.g., a sharp Electric Blue `#007AFF` or striking Neon Green `#10B981` / Orange) to draw attention to primary actions (buttons, progress bars), leaving the rest of the UI monochromatic.
*   **Typography:** Focus on strong typographic hierarchy—oversized bold headers paired with clean, muted secondary text (`#A1A1AA`). Left-alignment will be favored over center-alignment for a more editorial, structured feel.

## 2. Design Tokens (Theme Updates)
*   **Colors:**
    *   `background`: `#000000` (True black for OLED) or `#09090B` (Zinc 950)
    *   `surface`: `#18181B` (Zinc 900)
    *   `border`: `#27272A` (Zinc 800)
    *   `primary`: `#FAFAFA` (Zinc 50 - high contrast for primary buttons)
    *   `primaryText`: `#000000` (For text on primary buttons)
    *   `accent`: `#3B82F6` (Blue 500) or `#10B981` (Emerald 500)
    *   `text`: `#FAFAFA` (Zinc 50)
    *   `textSecondary`: `#A1A1AA` (Zinc 400)
    *   `textMuted`: `#71717A` (Zinc 500)
*   **Border Radius:** Reduce border radii for a sharper look. Shift from `lg (16)` / `md (12)` to `md (8)` or `sm (6)`.
*   **Shadows:** Completely remove colored "glow" shadows and heavy drop shadows. Rely on borders and background contrast for depth.

## 3. Component Updates
*   **Card:**
    *   Remove `variant="glass"` and `variant="highlight"` glow effects.
    *   Standard card: Solid surface color (`#18181B`), thin border (`#27272A`), no shadow.
*   **Button:**
    *   Primary: White background (`#FAFAFA`) with Black text (`#000000`). Very "premium/modern" feel.
    *   Secondary/Outline: Transparent background, thin gray border, white text.
    *   Remove activity indicator colors competing with backgrounds (use black/white).
*   **Badge:**
    *   Flat colors, pill-shaped but with less padding. Very subtle background tints with high-contrast text.
*   **Tabs Layout:**
    *   Flat bottom bar, solid `#000000` background, thin top border (`#27272A`). Active icons in bright white, inactive in muted gray.

## 4. Screen-by-Screen UX Improvements
*   **Login (`login.tsx`):**
    *   Move from a centered, playful layout to a left-aligned, stark, editorial layout.
    *   Oversized typography for "DevRats".
    *   Features listed in a clean, vertical list with subtle icons.
*   **Home (`home.tsx`):**
    *   Remove emojis from stats cards, replace with crisp vector icons (Feather/Ionicons) or just stark numbers.
    *   Progress bar becomes a razor-thin, bright accent line.
    *   Recent activity list items become tightly packed rows with minimal padding and clear separators.
*   **Leaderboard (`leaderboard.tsx`):**
    *   Clean list format. Ranks are strictly numerical (no gold/silver text colors, just neutral grays), letting the avatar and score stand out.
*   **Profile (`profile.tsx`):**
    *   Minimalist layout. Avatar, name, and a list of settings/actions below it.

## 5. Execution Steps
1.  Overwrite `src/theme/index.ts` with the new Clean Modern token palette.
2.  Refactor `Card.tsx`, `Button.tsx`, `Badge.tsx`, and `Avatar.tsx` to apply the new tokens and remove legacy shadows/glass styles.
3.  Update `app/(tabs)/_layout.tsx` for the new tab bar styling.
4.  Refactor `login.tsx` layout for the new editorial aesthetic.
5.  Refactor `home.tsx` to streamline the dashboard.
6.  Refactor `leaderboard.tsx` and `profile.tsx`.
7.  Verify visual consistency and ensure no regressions in functionality.
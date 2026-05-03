# CodeRats UI/UX Design System

## 🎨 Visual Identity & Aesthetic
CodeRats uses a **Modern Glassmorphism** aesthetic combined with a clean, developer-centric interface. The design focuses on high readability, interactive feedback, and a premium "pro" feel.

- **Aesthetic**: Glassmorphism, subtle gradients, and depth through layered shadows.
- **Vibe**: High-tech, gamified coding experience, professional yet vibrant.
- **Themes**: Full support for **Light** and **Dark** modes with a deep purple-black dark theme.

---

## 🌈 Color Palette

### Light Theme
| Token | Value | Usage |
| :--- | :--- | :--- |
| **Primary** | `#3B82F6` | Main brand color, primary actions |
| **Accent** | `#10B981` | Highlights and secondary features |
| **Background** | `#FFFFFF` | Main screen background |
| **Surface** | `#FFFFFF` | Cards and elevated elements |
| **Text** | `#0F172A` | Primary readability |
| **Text Secondary** | `#475569` | Descriptions and labels |

### Dark Theme
| Token | Value | Usage |
| :--- | :--- | :--- |
| **Primary** | `#818CF8` | Indigo-based primary action color |
| **Accent** | `#A78BFA` | Purple-based accent |
| **Background** | `#0F0F1A` | Deep midnight background |
| **Surface** | `#1E1E32` | Elevated dark surfaces |
| **Text** | `#F1F5F9` | High contrast primary text |
| **Text Secondary** | `#94A3B8` | Muted descriptions |

---

## ⌨️ Typography
The project uses a bold, modern typographic scale with a focus on hierarchy and weight.

- **Headings**: Heavy weights (`800` to `900`) with negative letter-spacing (`-0.5` to `-2`) for a compact, punchy look.
- **Body**: Medium weights (`500` to `600`) for secondary information.
- **Numbers**: Monospaced-like readability for stats and XP values.

---

## 🧱 Core UI Components

### 1. Cards (`Card.tsx`)
- **Default**: Solid background with subtle border.
- **Glass**: Semi-transparent background with blur effects and thin borders. Used for main dashboard elements.
- **Highlight**: Background secondary tint for focus areas.

### 2. Buttons (`Button.tsx`)
- **Primary**: Bold color with high-contrast text.
- **Secondary**: Outlined or glass-style with icon support.

### 3. Gamification Elements
- **Streak Flame**: Orange/Amber (`#F59E0B`) icon and text badge representing daily consistency.
- **XP Progress Bar**: Linear gradient (`Primary` to `Accent`) showing daily goal completion.
- **Points Pill**: Small rounded labels for XP gains (e.g., `+50 XP`).

---

## 📱 Key Screens & UX Flows

### Home Dashboard
- **Header**: Personalized greeting with live online indicator.
- **Hero Card**: Total XP display with high-impact typography and daily progress bar.
- **Quick Stats**: Grid layout for current and best streaks.
- **Recent Activity**: Vertical list of code commits and XP gains.

### Leaderboard
- **Global Ranking**: Highlighting the user's position relative to others.
- **Interactive Tiers**: Visual distinction between top performers and general users.

### Profile
- **Account Management**: Centralized settings for appearance (theme switcher), notifications, and security.
- **GitHub Integration**: Visual badge showing connected source control.

---

## ✨ Micro-interactions & Effects
- **Gradients**: Subtle background gradients using `expo-linear-gradient` to add depth.
- **Shadows**: Custom `glow` shadow for main action cards.
- **Loading**: Pulse and shimmer effects (via `isLoading` states) for data fetching.
- **Real-time**: WebSocket integration for instant leaderboard and score updates.

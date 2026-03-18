# Phase 1: Design System — Bộ Theme dùng chung Web & Mobile

> **Mục tiêu:** Xây dựng một Design System thống nhất để tái sử dụng trên cả Web (Next.js) và Mobile (React Native / Flutter).  
> **Output:** Token file, color palette, typography scale, spacing system, component guidelines.

---

## 📱 Mobile Integration (React Native / Expo)

Hệ thống Design System của Vivu Travel được thiết kế theo hướng **Token-driven**, cho phép đồng bộ hóa hoàn toàn giữa Web và Mobile.

### 1. Sử dụng Tokens
Mobile App (React Native) tiêu thụ bộ tokens thông qua file:  
👉 [mobile-tokens.json](./mobile-tokens.json)

**Ví dụ triển khai với NativeWind (Tailwind for React Native):**
```javascript
// tailwind.config.js
const tokens = require('./docs/01-system-foundation/mobile-tokens.json');

module.exports = {
  theme: {
    extend: {
      colors: tokens.colors,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
    }
  }
}
```

### 2. Quy tắc Component trên Mobile
- **Interactive Area:** Mọi nút bấm phải có diện tích tối thiểu `44x44px` (Apple/Google standard).
- **Haptic Feedback:** Sử dụng rung nhẹ (haptic) khi người dùng hoàn thành các hành động quan trọng (Confirm booking, Like tour).
- **Dark Mode:** Tự động switch theo hệ điều hành bằng cách sử dụng `useColorScheme` link với tokens.

### 3. Fonts
Sử dụng Font **Plus Jakarta Sans**. 
- Tải qua [Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans).
- Expo: Dùng `expo-font` để load file `.ttf`.

---

## 1. Color Tokens

### Primary Palette

| Token | Light | Dark | Sử dụng |
|---|---|---|---|
| `--color-primary` | `#006FEE` | `#3385DA` | CTA buttons, links, active states |
| `--color-primary-light` | `#66B2FF` | `#5EA3F0` | Hover, badge backgrounds |
| `--color-primary-dark` | `#004AAD` | `#1A5FB4` | Pressed states |
| `--color-secondary` | `#FCC219` | `#FCC219` | Accent Việt Nam, badges, highlights |
| `--color-secondary-dark` | `#CA9B14` | `#CA9B14` | Secondary pressed |

### Neutral Palette

| Token | Light | Dark | Sử dụng |
|---|---|---|---|
| `--color-background` | `#FAFAFA` | `#0D1117` | Page background |
| `--color-surface` | `#FFFFFF` | `#161B22` | Cards, modals |
| `--color-surface-hover` | `#F5F5F5` | `#1C2128` | Hover trên surface |
| `--color-border` | `#E5E7EB` | `#30363D` | Borders, dividers |
| `--color-text-primary` | `#1A1A1A` | `#F0F6FC` | Headings, body text |
| `--color-text-secondary` | `#6B7280` | `#8B949E` | Subtitles, captions |
| `--color-text-muted` | `#9CA3AF` | `#484F58` | Disabled, placeholders |

### Semantic Colors

| Token | Value | Sử dụng |
|---|---|---|
| `--color-success` | `#10B981` | Confirmed, positive |
| `--color-warning` | `#F59E0B` | Pending, caution |
| `--color-error` | `#EF4444` | Cancelled, errors |
| `--color-info` | `#3B82F6` | Info badges |

---

## 2. Typography Scale

### Font Families

| Token | Web (CSS) | Mobile | Sử dụng |
|---|---|---|---|
| `--font-primary` | `Inter, system-ui, sans-serif` | Inter / SF Pro / Roboto | UI text |
| `--font-serif` | `'Plus Jakarta Sans', Georgia, serif` | Plus Jakarta Sans | Headings nghệ thuật |
| `--font-mono` | `'JetBrains Mono', monospace` | JetBrains Mono | Code snippets |

### Type Scale

| Token | Size | Line Height | Weight | Sử dụng |
|---|---|---|---|---|
| `display-xl` | 60px / 3.75rem | 1.1 | 900 (Black) | Hero titles |
| `display-lg` | 48px / 3rem | 1.15 | 900 | Section titles |
| `heading-1` | 36px / 2.25rem | 1.2 | 800 | Page titles |
| `heading-2` | 30px / 1.875rem | 1.25 | 700 | Section headers |
| `heading-3` | 24px / 1.5rem | 1.3 | 700 | Subsections |
| `body-lg` | 18px / 1.125rem | 1.6 | 400 | Large body text |
| `body` | 16px / 1rem | 1.6 | 400 | Default body |
| `body-sm` | 14px / 0.875rem | 1.5 | 500 | Secondary text |
| `caption` | 12px / 0.75rem | 1.4 | 700 | Labels, badges |
| `overline` | 10px / 0.625rem | 1.3 | 900 | Uppercase labels |

---

## 3. Spacing System (8px base)

| Token | Value | Sử dụng |
|---|---|---|
| `space-1` | 4px | Minimal gaps |
| `space-2` | 8px | Tight spacing |
| `space-3` | 12px | Input padding |
| `space-4` | 16px | Card padding, gaps |
| `space-5` | 20px | Section gaps |
| `space-6` | 24px | Between sections |
| `space-8` | 32px | Large sections |
| `space-10` | 40px | Page padding |
| `space-12` | 48px | Major sections |
| `space-16` | 64px | Section margins |
| `space-20` | 80px | Page sections |

---

## 4. Border Radius

| Token | Value | Sử dụng |
|---|---|---|
| `radius-sm` | 8px | Small buttons, chips |
| `radius-md` | 12px | Inputs, cards |
| `radius-lg` | 16px | Large cards |
| `radius-xl` | 24px | Featured cards |
| `radius-2xl` | 32px | Hero sections |
| `radius-full` | 9999px | Avatars, pills |

---

## 5. Shadows

| Token | Light Mode | Dark Mode | Sử dụng |
|---|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | `0 4px 6px rgba(0,0,0,0.4)` | Cards |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | `0 10px 15px rgba(0,0,0,0.5)` | Modals |
| `shadow-primary` | `0 8px 20px rgba(0,111,238,0.2)` | `0 8px 20px rgba(51,133,218,0.3)` | Primary CTA |

---

## 6. Animation Tokens

| Token | Value | Sử dụng |
|---|---|---|
| `duration-fast` | 150ms | Hover, toggle |
| `duration-normal` | 300ms | Transitions |
| `duration-slow` | 500ms | Theme switch, page |
| `easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard |
| `easing-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful interactions |

---

## 7. Breakpoints

| Token | Value | Target |
|---|---|---|
| `mobile` | 0–639px | Phone portrait |
| `sm` | 640px | Phone landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / small desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

---

## 8. Component Patterns (Cross-platform)

| Pattern | Web (HeroUI) | Mobile Equivalent |
|---|---|---|
| Primary Button | `Button color="primary" radius="full"` | Rounded filled button, primary color |
| Card | `Card` w/ rounded-2xl shadow | Elevated card, 16px radius |
| Input | `Input variant="bordered" radius="lg"` | Bordered text field, 12px radius |
| Avatar | `Avatar` circular | Circular image, fallback initials |
| Badge | Chip / span with overline text | Small rounded label |
| Navigation | `Navbar` sticky | Bottom tab bar + drawer |
| Theme Toggle | `Switch` with Sun/Moon icons | System toggle or in-app switch |

---

## 9. Export Format

| Platform | Format | File |
|---|---|---|
| Web (Tailwind) | CSS Custom Properties | `styles/globals.css` |
| Web (JS) | TypeScript constants | `config/theme.ts` |
| Mobile (RN) | JSON tokens | `tokens/theme.json` |
| Figma | Design Tokens plugin | `tokens/figma-tokens.json` |

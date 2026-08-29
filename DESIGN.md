---
name: Volta AI
colors:
  surface: '#131316'
  surface-dim: '#131316'
  surface-bright: '#39393c'
  surface-container-lowest: '#0e0e11'
  surface-container-low: '#1b1b1e'
  surface-container: '#1f1f22'
  surface-container-high: '#2a2a2d'
  surface-container-highest: '#353437'
  on-surface: '#e4e1e5'
  on-surface-variant: '#c8c5ca'
  inverse-surface: '#e4e1e5'
  inverse-on-surface: '#303033'
  outline: '#919095'
  outline-variant: '#47464a'
  surface-tint: '#c8c6c8'
  primary: '#c8c6c8'
  on-primary: '#313032'
  primary-container: '#09090b'
  on-primary-container: '#7a787b'
  inverse-primary: '#5f5e60'
  secondary: '#4de082'
  on-secondary: '#003919'
  secondary-container: '#00b55d'
  on-secondary-container: '#003e1c'
  tertiary: '#f9bd22'
  on-tertiary: '#402d00'
  tertiary-container: '#0f0800'
  on-tertiary-container: '#9a7300'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5e1e4'
  primary-fixed-dim: '#c8c6c8'
  on-primary-fixed: '#1c1b1d'
  on-primary-fixed-variant: '#474649'
  secondary-fixed: '#6dfe9c'
  secondary-fixed-dim: '#4de082'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005227'
  tertiary-fixed: '#ffdf9f'
  tertiary-fixed-dim: '#f9bd22'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#131316'
  on-background: '#e4e1e5'
  surface-variant: '#353437'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.6'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for **Volta AI**, a high-performance logistics voice agent. The brand personality is precise, industrial, and hyper-efficient, reflecting the mission-critical nature of supply chain automation.

The visual style is **Minimalist-Technical**. It draws inspiration from high-end developer tools and industrial dashboards, utilizing a dark-mode-first approach with high-contrast accents. The aesthetic relies on structural integrity—clean lines, deliberate whitespace, and functional color coding—rather than decorative elements. It evokes a sense of "Logistics Intelligence" through a workspace that feels like a command center: calm under pressure but ready to alert the user at a millisecond's notice.

## Colors

This design system utilizes a sophisticated grayscale foundation punctuated by high-visibility functional accents.

- **Foundations:** The primary background is a deep, obsidian black (`#020617`), providing maximum contrast for text. Surfaces and containers use a slightly lighter Zinc (`#09090b`) to create subtle depth.
- **Accents:** 
    - **Neon Green (#4ade80):** Represents "Active," "Online," or "Success." It is the heartbeat of the UI.
    - **Amber (#fbbf24):** Indicates "Processing," "In Transit," or "Action Required."
    - **Red (#f87171):** Reserved for "Rejections," "System Errors," or "Critical Delays."
- **Borders:** Use low-opacity Zinc borders (`#27272a`) to define structure without creating visual noise.

## Typography

The typography strategy prioritizes legibility in data-dense environments. 

- **Geist** is used for headlines to provide a sharp, technical character with tight tracking.
- **Inter** serves as the workhorse for all body copy and UI controls, chosen for its exceptional readability in dark mode.
- **JetBrains Mono** is introduced for labels, status codes, and terminal-style data readouts to reinforce the "Logistics Engine" theme.

For mobile devices, scale `display` and `headline-lg` down by 25% to ensure they remain within the viewport while maintaining their typographic hierarchy.

## Layout & Spacing

The layout philosophy follows a strict **4px baseline grid**. 

- **Grid System:** Use a 12-column fluid grid for desktop with 20px gutters. On mobile, transition to a single-column layout with 16px side margins.
- **Rhythm:** Spacing should be used to group related technical data. Use `16px (md)` for standard padding within cards and `24px (lg)` for sectional spacing.
- **Terminal View:** When displaying AI logs or flight paths, use a "compact" spacing mode (8px) to maximize information density.

## Elevation & Depth

In this dark-mode system, elevation is conveyed through **Tonal Layering** and **Subtle Outlines** rather than heavy shadows.

- **Level 0 (Base):** `#020617` — The canvas.
- **Level 1 (Cards/Containers):** `#09090b` with a 1px border of `#27272a`.
- **Level 2 (Popovers/Modals):** `#18181b` with a slightly brighter border and a very soft, large-radius black shadow (0 20px 25px -5px rgb(0 0 0 / 0.5)).
- **Interactive State:** Hovering over a card or button should increase the border-color opacity or add a faint glow using the Primary Green (0 0 10px -2px rgba(74, 222, 128, 0.2)).

## Shapes

The shape language is **Soft-Industrial**. 

- **Standard Radius:** 4px (`rounded-sm` or `rounded` in most frameworks) is the default for buttons, inputs, and badges. This maintains a sharp, professional edge.
- **Card Radius:** 8px (`rounded-lg`) is used for the main dashboard containers to provide a modern, "housed" feel.
- **Exceptions:** Use 0px for "Terminal" blocks to emphasize their raw, data-driven nature.

## Components
- **Buttons:** Primary buttons use a solid Zinc-100 background with dark text. Secondary buttons are "Ghost" style with subtle borders. Success actions use the Neon Green as a glow-border or text color rather than a full background to maintain the minimalist aesthetic.
- **Cards:** Dashboard cards should have a subtle gradient from top-left to bottom-right (Zinc-950 to Zinc-900) to create a premium "machined" look.
- **Badges:** Small, high-contrast indicators using JetBrains Mono. Use "dot" indicators (e.g., a pulsing Green dot) for real-time status.
- **Terminal Containers:** Use a background of `#000000` with a `border-zinc-800`. Text inside should be `mono-sm`.
- **Input Fields:** Dark backgrounds (`#020617`) with 1px Zinc borders. On focus, the border transitions to Zinc-400 with no outer glow.
- **AI Voice Waveform:** A specific component for Volta AI—use a simplified, 3-bar animated line in Neon Green to indicate the agent is "listening" or "speaking."

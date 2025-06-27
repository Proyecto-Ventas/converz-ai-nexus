import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

/** Theme provider component that wraps the application with theme context and provides dark/light mode support */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

/** Custom theme configuration with color schemes and design tokens */
export const theme = {
  // Color palette
  colors: {
    // Primary colors
    primary: {
      50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
      400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
      800: '#166534', 900: '#14532d',
    },
    // Secondary colors
    secondary: {
      50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
      400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
      800: '#5b21b6', 900: '#4c1d95',
    },
    // Neutral colors
    neutral: {
      50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db',
      400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151',
      800: '#1f2937', 900: '#111827',
    },
    // Success colors
    success: {
      50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
      400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
      800: '#065f46', 900: '#064e3b',
    },
    // Warning colors
    warning: {
      50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
      400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
      800: '#92400e', 900: '#78350f',
    },
    // Error colors
    error: {
      50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
      400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
      800: '#991b1b', 900: '#7f1d1d',
    },
    // Info colors
    info: {
      50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
      400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
      800: '#1e40af', 900: '#1e3a8a',
    },
  },
  // Border radius
  radii: {
    none: '0', sm: '0.125rem', base: '0.25rem', md: '0.375rem',
    lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem', full: '9999px',
  },
  // Shadows
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)', md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)', xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)', inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)', none: 'none',
  },
  // Spacing
  space: {
    px: '1px', 0: '0', 0.5: '0.125rem', 1: '0.25rem', 1.5: '0.375rem',
    2: '0.5rem', 2.5: '0.625rem', 3: '0.75rem', 3.5: '0.875rem', 4: '1rem',
    5: '1.25rem', 6: '1.5rem', 7: '1.75rem', 8: '2rem', 9: '2.25rem',
    10: '2.5rem', 11: '2.75rem', 12: '3rem', 14: '3.5rem', 16: '4rem',
    20: '5rem', 24: '6rem', 28: '7rem', 32: '8rem', 36: '9rem',
    40: '10rem', 44: '11rem', 48: '12rem', 52: '13rem', 56: '14rem',
    60: '15rem', 64: '16rem',
  },
  // Breakpoints
  breakpoints: {
    sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px',
  },
  // Z-indices
  zIndices: {
    hide: -1, auto: 'auto', base: 0, docked: 10, dropdown: 1000,
    sticky: 1100, banner: 1200, overlay: 1300, modal: 1400, popover: 1500,
    skipLink: 1600, toast: 1700, tooltip: 1800,
  },
  // Transitions
  transitions: {
    default: 'all 0.2s ease-in-out', fast: 'all 0.1s ease-in-out', slow: 'all 0.3s ease-in-out',
  },
}

/** Type for the theme object */
export type Theme = typeof theme

/** Type for theme colors */
export type ThemeColors = keyof typeof theme.colors

/** Type for theme color shades */
export type ThemeColorShades = keyof typeof theme.colors.primary

// Export the theme as default
export default theme

import { css } from '@emotion/react'
import { CSSProperties } from 'react'

// Font families
export const fontFamilies = {
  sans: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
  ].join(','),
  mono: [
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ].join(','),
  serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'].join(','),
}

// Font weights
export const fontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const

// Font sizes
const baseFontSize = '1rem' // 16px
export const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: baseFontSize,
  lg: '1.125rem',  // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
  '7xl': '4.5rem',   // 72px
  '8xl': '6rem',     // 96px
  '9xl': '8rem',     // 128px
} as const

// Line heights
export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const

// Letter spacing
export const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

// Text colors
export const textColors = {
  primary: 'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  tertiary: 'var(--text-tertiary)',
  muted: 'var(--text-muted)',
  inverted: 'var(--text-inverted)',
  success: 'var(--text-success)',
  warning: 'var(--text-warning)',
  danger: 'var(--text-danger)',
  info: 'var(--text-info)',
} as const

// Text styles
export const textStyles = {
  // Display styles
  display1: {
    fontSize: fontSizes['6xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.tight,
  },
  display2: {
    fontSize: fontSizes['5xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.tight,
  },
  display3: {
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.tight,
  },

  // Heading styles
  h1: {
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.tight,
  },
  h2: {
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.tight,
  },
  h3: {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights.snug,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacings.tight,
  },
  h4: {
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.snug,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacings.tight,
  },
  h5: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.snug,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacings.normal,
  },
  h6: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacings.normal,
  },

  // Body text
  body1: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.relaxed,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  body2: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.relaxed,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  small: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  // Special text
  caption: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacings.wide,
    textTransform: 'uppercase' as const,
  },
  overline: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacings.wider,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.none,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacings.wide,
    textTransform: 'uppercase' as const,
  },
} as const

// Text utility functions
export function getTextStyle(style: keyof typeof textStyles) {
  return textStyles[style]
}

export function getFontFamily(family: keyof typeof fontFamilies) {
  return fontFamilies[family]
}

export function getFontWeight(weight: keyof typeof fontWeights) {
  return fontWeights[weight]
}

export function getFontSize(size: keyof typeof fontSizes) {
  return fontSizes[size]
}

export function getLineHeight(height: keyof typeof lineHeights) {
  return lineHeights[height]
}

export function getLetterSpacing(spacing: keyof typeof letterSpacings) {
  return letterSpacings[spacing]
}

// Text component props
export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** Text variant */
  variant?: keyof typeof textStyles
  /** Font family */
  fontFamily?: keyof typeof fontFamilies
  /** Font weight */
  fontWeight?: keyof typeof fontWeights
  /** Text color */
  color?: keyof typeof textColors
  /** Text alignment */
  align?: CSSProperties['textAlign']
  /** Truncate text with an ellipsis */
  truncate?: boolean
  /** Number of lines to show before truncating */
  lineClamp?: number
  /** Custom styles */
  css?: any
  /** HTML element to render */
  as?: React.ElementType
}

// Text component
export const Text = React.forwardRef<HTMLElement, TextProps>(({
  variant = 'body1',
  fontFamily = 'sans',
  fontWeight,
  color = 'primary',
  align,
  truncate = false,
  lineClamp,
  css: customCss,
  as: Component = 'p',
  ...props
}, ref) => {
  const style = getTextStyle(variant)
  
  const css = [
    {
      fontFamily: getFontFamily(fontFamily),
      fontWeight: fontWeight ? getFontWeight(fontWeight) : style.fontWeight,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      color: textColors[color],
      textAlign: align,
      margin: 0,
      ...(truncate && {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }),
      ...(lineClamp && {
        display: '-webkit-box',
        WebkitLineClamp: lineClamp,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }),
      ...(style as any).textTransform && {
        textTransform: (style as any).textTransform,
      },
    },
    customCss,
  ]

  return <Component ref={ref} css={css} {...props} />
})

Text.displayName = 'Text'

// Export all text styles as components
export const Display1 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="display1" {...props} />
)

export const Display2 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="display2" {...props} />
)

export const Display3 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="display3" {...props} />
)

export const H1 = (props: Omit<TextProps, 'variant'>) => (
  <Text as="h1" variant="h1" {...props} />
)

export const H2 = (props: Omit<TextProps, 'variant'>) => (
  <Text as="h2" variant="h2" {...props} />
)

export const H3 = (props: Omit<TextProps, 'variant'>) => (
  <Text as="h3" variant="h3" {...props} />
)

export const H4 = (props: Omit<TextProps, 'variant'>) => (
  <Text as="h4" variant="h4" {...props} />
)

export const H5 = (props: Omit<TextProps, 'variant'>) => (
  <Text as="h5" variant="h5" {...props} />
)

export const H6 = (props: Omit<TextProps, 'variant'>) => (
  <Text as="h6" variant="h6" {...props} />
)

export const Body1 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="body1" {...props} />
)

export const Body2 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="body2" {...props} />
)

export const Small = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="small" {...props} />
)

export const Caption = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="caption" {...props} />
)

export const Overline = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="overline" {...props} />
)

export const ButtonText = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="button" {...props} />
)

export default {
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacings,
  textColors,
  textStyles,
  Text,
  Display1,
  Display2,
  Display3,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Body1,
  Body2,
  Small,
  Caption,
  Overline,
  ButtonText,
}

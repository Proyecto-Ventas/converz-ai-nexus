import * as React from 'react'
import { cn } from '@/lib/utils'
import { spacing } from '@/lib/spacing'

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns on different screen sizes
   * @default { sm: 1, md: 2, lg: 3, xl: 4 }
   */
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  /** Gap between grid items */
  gap?: keyof typeof spacing | (string & {})
  /** Gap between rows */
  gapY?: keyof typeof spacing | (string & {})
  /** Gap between columns */
  gapX?: keyof typeof spacing | (string & {})
  /** Auto-fit columns */
  autoFit?: boolean
  /** Auto-fill columns */
  autoFill?: boolean
  /** Minimum width of each column */
  minColumnWidth?: string
  /** Maximum width of each column */
  maxColumnWidth?: string
  /** Align items along the cross axis */
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
  /** Justify content along the main axis */
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  /** Stack items on mobile */
  stackOnMobile?: boolean
  /** Stack items on tablet */
  stackOnTablet?: boolean
  /** Stack items on desktop */
  stackOnDesktop?: boolean
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(({
  className,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  gapX,
  gapY,
  autoFit = false,
  autoFill = false,
  minColumnWidth = '250px',
  maxColumnWidth = '1fr',
  align = 'stretch',
  justify = 'start',
  stackOnMobile = false,
  stackOnTablet = false,
  stackOnDesktop = false,
  ...props
}, ref) => {
  // Generate responsive grid template columns
  const getGridTemplateColumns = () => {
    if (autoFit || autoFill) {
      const minMax = `minmax(${minColumnWidth}, ${maxColumnWidth})`
      return autoFit 
        ? `repeat(auto-fit, ${minMax})`
        : `repeat(auto-fill, ${minMax})`
    }

    // Generate responsive grid template columns based on breakpoints
    const breakpoints = [
      { key: 'xs', value: cols.xs },
      { key: 'sm', value: cols.sm },
      { key: 'md', value: cols.md },
      { key: 'lg', value: cols.lg },
      { key: 'xl', value: cols.xl },
      { key: '2xl', value: cols['2xl'] },
    ].filter(item => item.value !== undefined)

    if (breakpoints.length === 0) return 'repeat(1, 1fr)'

    // Generate media queries for responsive columns
    return breakpoints
      .map(({ key, value }, index) => {
        const isLast = index === breakpoints.length - 1
        const mediaQuery = key === 'xs' 
          ? '' 
          : `@media (min-width: ${key === 'sm' ? '640px' : key === 'md' ? '768px' : key === 'lg' ? '1024px' : key === 'xl' ? '1280px' : '1536px'})`
        
        return `${mediaQuery} {
          grid-template-columns: repeat(${value}, 1fr);
        }`
      })
      .join('\n')
  }

  // Generate CSS variables for grid
  const gridStyles: React.CSSProperties & {
    '--grid-gap'?: string
    '--grid-gap-x'?: string
    '--grid-gap-y'?: string
  } = {}

  // Set gap values
  if (gap) {
    gridStyles['--grid-gap'] = typeof gap === 'string' ? gap : spacing[gap as keyof typeof spacing] || spacing[4]
  }
  if (gapX) {
    gridStyles['--grid-gap-x'] = typeof gapX === 'string' ? gapX : spacing[gapX as keyof typeof spacing] || spacing[4]
  }
  if (gapY) {
    gridStyles['--grid-gap-y'] = typeof gapY === 'string' ? gapY : spacing[gapY as keyof typeof spacing] || spacing[4]
  }

  // Alignment classes
  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  } as const

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  } as const

  return (
    <div
      ref={ref}
      className={cn(
        'grid',
        'gap-[var(--grid-gap,1rem)]',
        gapX && 'gap-x-[var(--grid-gap-x,1rem)]',
        gapY && 'gap-y-[var(--grid-gap-y,1rem)]',
        alignClasses[align],
        justifyClasses[justify],
        stackOnMobile && 'grid-cols-1',
        stackOnTablet && 'md:grid-cols-1',
        stackOnDesktop && 'lg:grid-cols-1',
        className
      )}
      style={{
        ...gridStyles,
        ...(autoFit || autoFill ? { gridTemplateColumns: getGridTemplateColumns() } : {}),
      }}
      {...props}
    />
  )
})

Grid.displayName = 'Grid'

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column span on different screen sizes */
  span?: {
    xs?: number | 'full' | 'auto'
    sm?: number | 'full' | 'auto'
    md?: number | 'full' | 'auto'
    lg?: number | 'full' | 'auto'
    xl?: number | 'full' | 'auto'
    '2xl'?: number | 'full' | 'auto'
  } | number | 'full' | 'auto'
  /** Column start on different screen sizes */
  start?: {
    xs?: number | 'auto'
    sm?: number | 'auto'
    md?: number | 'auto'
    lg?: number | 'auto'
    xl?: number | 'auto'
    '2xl'?: number | 'auto'
  } | number | 'auto'
  /** Column end on different screen sizes */
  end?: {
    xs?: number | 'auto'
    sm?: number | 'auto'
    md?: number | 'auto'
    lg?: number | 'auto'
    xl?: number | 'auto'
    '2xl'?: number | 'auto'
  } | number | 'auto'
  /** Row span */
  rowSpan?: number | 'full' | 'auto'
  /** Row start */
  rowStart?: number | 'auto'
  /** Row end */
  rowEnd?: number | 'auto'
  /** Align self */
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
  /** Justify self */
  justify?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(({
  className,
  span,
  start,
  end,
  rowSpan,
  rowStart,
  rowEnd,
  align = 'auto',
  justify = 'auto',
  ...props
}, ref) => {
  // Generate span classes
  const getSpanClasses = () => {
    if (!span) return ''
    
    if (typeof span === 'number' || span === 'full' || span === 'auto') {
      return span === 'full' 
        ? 'col-span-full' 
        : span === 'auto' 
          ? 'col-auto' 
          : `col-span-${span}`
    }

    return Object.entries(span)
      .map(([breakpoint, value]) => {
        const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`
        return value === 'full' 
          ? `${prefix}col-span-full` 
          : value === 'auto' 
            ? `${prefix}col-auto` 
            : `${prefix}col-span-${value}`
      })
      .join(' ')
  }

  // Generate start classes
  const getStartClasses = () => {
    if (!start) return ''
    
    if (typeof start === 'number' || start === 'auto') {
      return start === 'auto' ? 'col-start-auto' : `col-start-${start}`
    }

    return Object.entries(start)
      .map(([breakpoint, value]) => {
        const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`
        return value === 'auto' 
          ? `${prefix}col-start-auto` 
          : `${prefix}col-start-${value}`
      })
      .join(' ')
  }

  // Generate end classes
  const getEndClasses = () => {
    if (!end) return ''
    
    if (typeof end === 'number' || end === 'auto') {
      return end === 'auto' ? 'col-end-auto' : `col-end-${end}`
    }

    return Object.entries(end)
      .map(([breakpoint, value]) => {
        const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`
        return value === 'auto' 
          ? `${prefix}col-end-auto` 
          : `${prefix}col-end-${value + 1}` // Add 1 because grid lines are 1-based
      })
      .join(' ')
  }

  // Alignment classes
  const alignSelfClasses = {
    auto: 'self-auto',
    start: 'self-start',
    end: 'self-end',
    center: 'self-center',
    stretch: 'self-stretch',
    baseline: 'self-baseline',
  } as const

  const justifySelfClasses = {
    auto: 'justify-self-auto',
    start: 'justify-self-start',
    end: 'justify-self-end',
    center: 'justify-self-center',
    stretch: 'justify-self-stretch',
    baseline: 'justify-self-baseline',
  } as const

  return (
    <div
      ref={ref}
      className={cn(
        span && getSpanClasses(),
        start && getStartClasses(),
        end && getEndClasses(),
        rowSpan && (rowSpan === 'full' ? 'row-span-full' : rowSpan === 'auto' ? 'row-auto' : `row-span-${rowSpan}`),
        rowStart && (rowStart === 'auto' ? 'row-start-auto' : `row-start-${rowStart}`),
        rowEnd && (rowEnd === 'auto' ? 'row-end-auto' : `row-end-${rowEnd}`),
        alignSelfClasses[align],
        justifySelfClasses[justify],
        className
      )}
      {...props}
    />
  )
})

GridItem.displayName = 'GridItem'

export { Grid, GridItem }

import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'filled' | 'elevated'
  hoverEffect?: 'none' | 'scale' | 'shadow' | 'grow'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default',
    hoverEffect = 'none',
    rounded = 'lg',
    ...props 
  }, ref) => {
    const variants = {
      default: 'bg-white border-gray-200',
      outline: 'bg-transparent border-gray-200',
      filled: 'bg-gray-50 border-transparent',
      elevated: 'bg-white shadow-md border-transparent',
    }

    const hoverEffects = {
      none: '',
      scale: 'hover:scale-[1.01] transition-transform duration-200',
      shadow: 'hover:shadow-md transition-shadow duration-200',
      grow: 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    }

    const roundness = {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'border transition-all duration-200',
          variants[variant],
          hoverEffects[hoverEffect],
          roundness[rounded],
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  withBorder?: boolean
  spacing?: 'sm' | 'md' | 'lg'
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, withBorder = false, spacing = 'md', ...props }, ref) => {
    const spacingClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col space-y-1.5',
          spacingClasses[spacing],
          withBorder && 'border-b border-gray-100',
          className
        )}
        {...props}
      />
    )
  }
)
CardHeader.displayName = "CardHeader"

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  size?: 'sm' | 'md' | 'lg'
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'text-lg font-semibold',
      md: 'text-xl font-semibold',
      lg: 'text-2xl font-bold',
    }

    return (
      <Component
        ref={ref}
        className={cn(
          'text-gray-900 leading-tight tracking-tight',
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
CardTitle.displayName = "CardTitle"

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'md'
  muted?: boolean
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, size = 'sm', muted = true, ...props }, ref) => {
    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
    }

    return (
      <p
        ref={ref}
        className={cn(
          sizes[size],
          muted ? 'text-gray-500' : 'text-gray-700',
          className
        )}
        {...props}
      />
    )
  }
)
CardDescription.displayName = "CardDescription"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  noTopPadding?: boolean
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding = 'md', noTopPadding = false, ...props }, ref) => {
    const paddings = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          paddings[padding],
          noTopPadding && 'pt-0',
          className
        )}
        {...props}
      />
    )
  }
)
CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  withBorder?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ 
    className, 
    justify = 'start',
    withBorder = false,
    padding = 'md',
    ...props 
  }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    }

    const paddings = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          justifyClasses[justify],
          withBorder && 'border-t border-gray-100',
          paddings[padding],
          className
        )}
        {...props}
      />
    )
  }
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

import { cn } from '@/utilities/ui'
import React from 'react'

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'interested'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  isLoading?: boolean
  asChild?: boolean
  children: React.ReactNode
}

const CustomButton = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  asChild = false,
  children,
  className,
  ...props
}: CustomButtonProps) => {
  const baseStyles =
    'relative cursor-pointer rounded-lg font-medium inline-flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 shadow-subtle',
    secondary: 'bg-secondary text-primary hover:bg-secondary/80 shadow-subtle',
    outline: 'border border-primary text-primary hover:bg-primary/5',
    ghost: 'text-primary hover:bg-primary/5',
    interested:
      'interested-btn bg-gradient-to-r from-primary to-primary/70 text-white shadow-subtle',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  }

  // If asChild is true, this will render the children directly
  const Comp = asChild ? React.Fragment : 'button'

  return (
    <Comp
      {...(asChild
        ? {}
        : {
          className: cn(
            baseStyles,
            variants[variant],
            sizes[size],
            fullWidth ? 'w-full' : '',
            isLoading ? 'opacity-70 cursor-not-allowed' : '',
            className,
          ),
          disabled: isLoading || props.disabled,
          ...props,
        })}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </Comp>
  )
}

export default CustomButton

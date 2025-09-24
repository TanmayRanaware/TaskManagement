import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'btn'
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      destructive: 'btn-destructive',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      link: 'btn-link',
    }
    const sizeClasses = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
    }

    const buttonClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      isLoading && 'opacity-50 cursor-not-allowed',
      className
    )

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: cn(buttonClasses, children.props.className),
        disabled: disabled || isLoading,
        ...props,
      })
    }

    return (
      <button
        className={buttonClasses}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button

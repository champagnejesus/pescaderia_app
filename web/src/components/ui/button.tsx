import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-abyssal-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-abyssal-primary text-abyssal-on-primary hover:opacity-90",
        secondary: "bg-abyssal-surface-high text-abyssal-text-primary hover:opacity-80",
        ghost: "bg-transparent text-abyssal-text-primary hover:bg-abyssal-surface-high",
      },
      size: {
        sm: "h-8 px-3 text-body-medium",
        md: "h-10 px-4 text-body-large",
        lg: "h-12 px-6 text-title-medium",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
)
Button.displayName = "Button"

export { Button, buttonVariants }

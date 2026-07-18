import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-abyssal-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-abyssal-primary text-white shadow-[0_2px_8px_rgba(94,92,230,0.35)] hover:shadow-[0_4px_16px_rgba(94,92,230,0.45)] hover:brightness-110",
        secondary:
          "bg-white/10 text-abyssal-text-primary border border-abyssal-outline/50 backdrop-blur-sm hover:bg-white/20 hover:border-abyssal-outline shadow-sm",
        ghost:
          "bg-transparent text-abyssal-primary hover:bg-abyssal-primary/10 active:bg-abyssal-primary/15",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-5 text-[15px]",
        lg: "h-[52px] px-8 text-[17px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }), loading && "relative pointer-events-none")}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-[18px] w-[18px] mr-2" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <path className="opacity-80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" d="M4 12a8 8 0 018-8" />
        </svg>
      )}
      {children}
    </button>
  )
)
Button.displayName = "Button"

export { Button, buttonVariants }

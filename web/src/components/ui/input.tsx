import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <div className="w-full">
    <input
      ref={ref}
      className={cn(
        "bg-abyssal-surface-high glass-subtle rounded-xl px-4 py-3.5 text-[15px] text-abyssal-text-primary w-full outline-none border border-abyssal-outline/40 focus:border-abyssal-primary/60 focus:ring-4 focus:ring-abyssal-primary/10 placeholder:text-abyssal-text-secondary transition-all duration-200",
        error && "border-abyssal-red/60 focus:border-abyssal-red focus:ring-abyssal-red/10",
        className
      )}
      {...props}
    />
    {error && (
      <p className="mt-1.5 text-[12px] font-medium text-abyssal-red">{error}</p>
    )}
  </div>
))
Input.displayName = "Input"

export { Input }

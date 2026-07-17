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
        "bg-abyssal-surface-high rounded-abyssal-sm px-4 py-3 text-abyssal-text-primary w-full outline-none border border-abyssal-outline focus:border-abyssal-primary focus:ring-2 focus:ring-abyssal-primary/20 placeholder:text-abyssal-text-secondary transition-all duration-200",
        error && "border-abyssal-red focus:border-abyssal-red focus:ring-abyssal-red/20",
        className
      )}
      {...props}
    />
    {error && (
      <p className="mt-1 text-label-small text-abyssal-red">{error}</p>
    )}
  </div>
))
Input.displayName = "Input"

export { Input }

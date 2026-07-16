import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "bg-abyssal-surface-high rounded-abyssal-sm px-4 py-3 text-abyssal-text-primary w-full outline-none border border-abyssal-outline focus:border-abyssal-primary placeholder:text-abyssal-text-secondary transition-colors",
      className,
    )}
    {...props}
  />
))
Input.displayName = "Input"

export { Input }

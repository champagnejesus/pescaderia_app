"use client"

import { memo, type ReactNode } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FABProps {
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  "aria-label"?: string
}

function FABComponent({ href, onClick, children, className, "aria-label": ariaLabel }: FABProps) {
  const baseStyles =
    "bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-20 right-4 text-abyssal-on-primary shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 z-30"

  if (href) {
    return (
      <Link
        href={href}
        className={cn(baseStyles, className)}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(baseStyles, className)}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}

export const FAB = memo(FABComponent)
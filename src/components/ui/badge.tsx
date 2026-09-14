//to be remade
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@neup/core/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "content">,
    VariantProps<typeof badgeVariants> {
  convey?: "danger" | "success" | "informative" | "warning"
  content?: {
    icon?: string
    count?: number
    text?: string
  }
}

function Badge({ className, variant, convey, content, children, ...props }: BadgeProps) {
  const conveyClass = {
    danger: "border-red-200 bg-red-100 text-red-700",
    success: "border-green-200 bg-green-100 text-green-700",
    informative: "border-blue-200 bg-blue-100 text-blue-700",
    warning: "border-orange-200 bg-orange-100 text-orange-700",
  }[convey ?? "informative"]
  const contentValue = content?.count !== undefined ? (
    content.count > 99 ? "99+" : content.count
  ) : content?.icon ? (
    <img src={content.icon} alt="" className="h-3.5 w-3.5 object-contain" />
  ) : content?.text
  const hasContent = contentValue !== undefined
  const showDefaultDot = !hasContent && !children

  return (
    <div className={cn(badgeVariants({ variant }), conveyClass, className)} {...props}>
      {hasContent ? contentValue : null}
      {hasContent && children ? " " : null}
      {showDefaultDot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-label="alert" /> : null}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }

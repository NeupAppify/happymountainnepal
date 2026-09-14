//to be remade

"use client"

import * as React from "react"

import { cn } from "@neup/core/utils"

const avatarColors = [
  '#2563eb',
  '#7c3aed',
  '#c026d3',
  '#db2777',
  '#e11d48',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#0d9488',
  '#0891b2',
]

function getAvatarColor(displayName?: string, neupid?: string): string {
  const source = displayName?.trim() || neupid?.trim() || 'U'
  let hash = 0

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) | 0
  }

  return avatarColors[(hash >>> 0) % avatarColors.length]
}

function getInitials(displayName?: string, neupid?: string): string {
  const source = displayName?.trim() || neupid?.trim() || 'U'
  return source.charAt(0).toUpperCase()
}

const AvatarContext = React.createContext<{
  imageLoaded: boolean
  setImageLoaded: (loaded: boolean) => void
  fallbackColor: string
  fallbackInitial: string
} | null>(null)

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  displayName?: string | null
  neupid?: string | null
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, displayName, neupid, ...props }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false)

    return (
      <AvatarContext.Provider
        value={{
          imageLoaded,
          setImageLoaded,
          fallbackColor: getAvatarColor(displayName ?? undefined, neupid ?? undefined),
          fallbackInitial: getInitials(displayName ?? undefined, neupid ?? undefined),
        }}
      >
        <div
          ref={ref}
          className={cn(
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
            className
          )}
          {...props}
        />
      </AvatarContext.Provider>
    )
  }
)
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentProps<"img">
>(({ className, onError, onLoad, src, ...props }, ref) => {
  const context = React.useContext(AvatarContext)

  return (
    <img
      ref={ref}
      src={src}
      className={cn(
        "absolute inset-0 h-full w-full object-cover",
        !context?.imageLoaded && "invisible",
        className
      )}
      onLoad={(event) => {
        context?.setImageLoaded(true)
        onLoad?.(event)
      }}
      onError={(event) => {
        context?.setImageLoaded(false)
        onError?.(event)
      }}
      {...props}
    />
  )
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, children, ...props }, ref) => {
  const context = React.useContext(AvatarContext)

  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-0 flex h-full w-full items-center justify-center rounded-full font-medium text-white",
        context?.imageLoaded && "hidden",
        className
      )}
      style={{ backgroundColor: context?.fallbackColor, ...style }}
      {...props}
    >
      {children ?? context?.fallbackInitial}
    </div>
  )
})
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }

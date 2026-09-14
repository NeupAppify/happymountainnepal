'use client'

import * as React from 'react'

import {
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react'

import { cn } from '@neup/core/utils'

import {
  TOAST_EXIT_DURATION,
  useToast,
  type ToastState,
  type ToastConvey,
  type ToasterToast,
} from '@neup/core/hooks/useToast'

import {
  Button,
  type ButtonProps,
} from '@neup/components/ui/button'

/*
|--------------------------------------------------------------------------
| Stack config
|--------------------------------------------------------------------------
*/

/*
 * Keep the newest two cards in the interface. Older cards stay in the
 * underlying group. Dismissal settings do not affect stack membership.
 */
const MAX_VISIBLE = 2

/*
 * How much of the toast behind should peek out.
 */
const STACK_Y_OFFSET = 10

/*
|--------------------------------------------------------------------------
| Icons
|--------------------------------------------------------------------------
*/

function getStateIcon(
  state?: ToastState
) {
  const className =
    'h-5 w-5'

  switch (state) {
    case 'warning':
      return (
        <TriangleAlert
          className={
            className
          }
        />
      )

    case 'error':
    case 'danger':
      return (
        <CircleX
          className={
            className
          }
        />
      )

    case 'success':
      return (
        <CircleCheck
          className={
            className
          }
        />
      )

    case 'info':
    default:
      return (
        <Info
          className={
            className
          }
        />
      )
  }
}

/*
|--------------------------------------------------------------------------
| ToastButton
|--------------------------------------------------------------------------
*/

export const ToastButton =
  React.forwardRef<
    HTMLButtonElement,
    ButtonProps
  >(
    (
      props,
      ref
    ) => (
      <Button
        ref={ref}
        {...props}
      />
    )
  )

ToastButton.displayName =
  'ToastButton'

/*
|--------------------------------------------------------------------------
| Basic custom Toast primitives
|--------------------------------------------------------------------------
|
| These have no Radix dependency.
|
| They are exported so you can still use:
|
| Toast
| ToastTitle
| ToastDescription
| ToastClose
| ToastAction
|
| elsewhere if needed.
|
*/

export const Toast =
  React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >(
    (
      {
        className,
        ...props
      },
      ref
    ) => (
      <div
        ref={ref}
        className={cn(
          'relative',
          className
        )}
        {...props}
      />
    )
  )

Toast.displayName = 'Toast'

export const ToastTitle =
  React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >(
    (
      {
        className,
        ...props
      },
      ref
    ) => (
      <div
        ref={ref}
        className={cn(
          'text-sm font-semibold',
          className
        )}
        {...props}
      />
    )
  )

ToastTitle.displayName =
  'ToastTitle'

export const ToastDescription =
  React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >(
    (
      {
        className,
        ...props
      },
      ref
    ) => (
      <div
        ref={ref}
        className={cn(
          'text-sm opacity-90',
          className
        )}
        {...props}
      />
    )
  )

ToastDescription.displayName =
  'ToastDescription'

export const ToastAction =
  React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >(
    (
      {
        className,
        ...props
      },
      ref
    ) => (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex h-8 items-center justify-center rounded-md border border-current/20 px-3 text-sm font-medium transition-colors hover:bg-black/5',
          className
        )}
        {...props}
      />
    )
  )

ToastAction.displayName =
  'ToastAction'

export const ToastClose =
  React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >(
    (
      {
        className,
        children,
        ...props
      },
      ref
    ) => (
      <button
        ref={ref}
        type="button"
        aria-label="Close notification"
        className={cn(
          'absolute right-2 top-2 rounded-md p-1 text-current/60 transition-colors hover:bg-black/10 hover:text-current',
          className
        )}
        {...props}
      >
        {children ?? (
          <X className="h-4 w-4" />
        )}
      </button>
    )
  )

ToastClose.displayName =
  'ToastClose'

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Compatibility component.
|
| There is no context/provider required anymore.
|
*/

export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

/*
|--------------------------------------------------------------------------
| Viewport
|--------------------------------------------------------------------------
*/

export const ToastViewport =
  React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >(
    (
      {
        className,
        ...props
      },
      ref
    ) => (
      <div
        ref={ref}
        aria-live="polite"
        aria-relevant="additions removals"
        className={cn(
          'pointer-events-none fixed bottom-0 right-0 z-[9999] flex max-h-screen w-full flex-col gap-3 p-4 md:max-w-[420px]',
          className
        )}
        {...props}
      />
    )
  )

ToastViewport.displayName =
  'ToastViewport'

/*
|--------------------------------------------------------------------------
| Visual toast
|--------------------------------------------------------------------------
*/

type VisualToastProps = {
  toast: ToasterToast

  index: number

  dismissToast: (
    id: string
  ) => void
}

const toastConveyClasses: Record<ToastConvey, string> = {
  danger:
    'bg-gradient-to-r from-red-50/45 via-white/80 to-white/95 text-red-950',
  dangerous:
    'bg-gradient-to-r from-red-50/45 via-white/80 to-white/95 text-red-950',
  warning:
    'bg-gradient-to-r from-orange-50/45 via-white/80 to-white/95 text-orange-950',
  success:
    'bg-gradient-to-r from-emerald-50/45 via-white/80 to-white/95 text-emerald-950',
  info:
    'bg-gradient-to-r from-blue-50/45 via-white/80 to-white/95 text-blue-950',
  none:
    'bg-gradient-to-r from-blue-50/45 via-white/80 to-white/95 text-blue-950',
}

const toastConveyBackgrounds: Record<ToastConvey, string> = {
  danger:
    'linear-gradient(to right, rgba(254, 242, 242, .45), rgba(255, 255, 255, .8), rgba(255, 255, 255, .95))',
  dangerous:
    'linear-gradient(to right, rgba(254, 242, 242, .45), rgba(255, 255, 255, .8), rgba(255, 255, 255, .95))',
  warning:
    'linear-gradient(to right, rgba(255, 247, 237, .45), rgba(255, 255, 255, .8), rgba(255, 255, 255, .95))',
  success:
    'linear-gradient(to right, rgba(236, 253, 245, .45), rgba(255, 255, 255, .8), rgba(255, 255, 255, .95))',
  info:
    'linear-gradient(to right, rgba(239, 246, 255, .45), rgba(255, 255, 255, .8), rgba(255, 255, 255, .95))',
  none:
    'linear-gradient(to right, rgba(239, 246, 255, .45), rgba(255, 255, 255, .8), rgba(255, 255, 255, .95))',
}

const toastConveyTextColors: Record<ToastConvey, string> = {
  danger: '#450a0a',
  dangerous: '#450a0a',
  warning: '#431407',
  success: '#052e16',
  info: '#172554',
  none: '#172554',
}

function getToastConvey(
  convey: ToastConvey | undefined,
  state: ToastState | undefined
): ToastConvey {
  if (convey === 'none') {
    return 'info'
  }

  if (convey) {
    return convey
  }

  if (state === 'error') {
    return 'danger'
  }

  return state ?? 'info'
}

function VisualToast({
  toast,
  index,
  dismissToast,
}: VisualToastProps) {
  const {
    id,
    title,
    description,
    state,
    icon,
    action,
    actions = [],
    className,
    dismissesOn,
    variant,
    convey,
  } = toast

  const toastConvey = getToastConvey(
    convey,
    state
  )

  const dismissAfter =
    dismissesOn === null
      ? undefined
      : dismissesOn ?? 0

  const canDismiss =
    dismissesOn !== null

  const isFront =
    index === 0

  const isExiting =
    toast.open === false

  const visibleActions =
    actions.slice(0, 2)

  /*
   * IMPORTANT:
   *
   * The entry animation is only for a toast while it is first front. A toast
   * that moves behind another toast must not replay it when promoted again.
   */
  const [isEntering, setIsEntering] =
    React.useState(
      () => index === 0
    )

  React.useEffect(() => {
    if (!isEntering) {
      return
    }

    if (!isFront) {
      setIsEntering(false)
      return
    }

    const timeout = window.setTimeout(
      () => {
        setIsEntering(false)
      },
      TOAST_EXIT_DURATION
    )

    return () => {
      window.clearTimeout(timeout)
    }
  }, [isEntering, isFront])

  React.useEffect(() => {
    if (
      !isFront ||
      isExiting ||
      typeof dismissAfter !== 'number' ||
      dismissAfter <= 0 ||
      !Number.isFinite(dismissAfter) ||
      dismissAfter < 0
    ) {
      return
    }

    const timeout = window.setTimeout(() => {
      dismissToast(id)
    }, Math.max(
      dismissAfter * 1000 - TOAST_EXIT_DURATION,
      0
    ))

    return () => {
      window.clearTimeout(timeout)
    }
  }, [dismissAfter, dismissToast, id, isExiting, isFront])

  /*
   * Stack depth styling.
   */
  const translateY =
    index *
    STACK_Y_OFFSET

  const widthReduction =
    index === 0
      ? 0
      : index === 1
        ? 16
        : 28

  const scale =
    index === 0
      ? 1
      : index === 1
        ? 0.98
        : 0.96

  const opacity =
    index === 0
      ? 1
      : index === 1
        ? 0.96
        : 0.86

  return (
    <div
      className={cn(
        /*
         * All cards occupy the exact same
         * grid cell.
         */
        'col-start-1 row-start-1',

        /*
         * Actual card styling.
         */
        'relative flex items-start justify-between gap-4 overflow-hidden rounded-xl p-4 pr-10',

        /*
         * Apple-ish floating surface.
         */
        'border border-black/[0.04] backdrop-blur-2xl backdrop-saturate-150',

        /*
         * Movement between stack positions.
         */
        'transition-[transform,width,opacity,box-shadow]',
        'ease-[cubic-bezier(0.22,1,0.36,1)]',

        /*
         * Light convey gradients keep the surface soft while making the
         * toast's meaning immediately recognizable.
         */
        toastConveyClasses[toastConvey],

        className
      )}
      style={{
        background: toastConveyBackgrounds[toastConvey],
        color: toastConveyTextColors[toastConvey],

        /*
         * Keep the front above everything.
         */
        zIndex:
          100 - index,

        /*
         * Every visible card can receive its own dismiss action. The front
         * card remains above the others, while the secondary card is
         * interactive wherever it is exposed by the stack.
         */
        pointerEvents:
          !isExiting
            ? 'auto'
            : 'none',

        /*
         * Card becomes narrower as it goes backward.
         */
        width: `calc(100% - ${widthReduction}px)`,

        /*
         * Exit always overrides normal stack position.
         */
        transform:
          isExiting
            ? 'translate3d(115%, 0, 0) scale(0.98)'
            : `translate3d(0, ${translateY}px, 0) scale(${scale})`,

        opacity:
          isExiting
            ? 0
            : opacity,

        boxShadow:
          index === 0
            ? '0 12px 38px rgba(15, 23, 42, 0.22)'
            : index === 1
              ? '0 8px 28px rgba(15, 23, 42, 0.16)'
              : '0 5px 20px rgba(15, 23, 42, 0.12)',

        transitionDuration:
          `${TOAST_EXIT_DURATION}ms`,

        /*
         * Only a newly mounted front card comes in from the right. A card
         * promoted from the stack uses the transform transition instead.
         */
        animation:
          isEntering &&
          isFront &&
          !isExiting
            ? `neup-toast-enter ${TOAST_EXIT_DURATION}ms cubic-bezier(0.22,1,0.36,1)`
            : undefined,
      }}
    >
      {/*
       * --------------------------------------------------------------
       * Main content
       * --------------------------------------------------------------
       */}
      <div className="flex min-w-0 items-start gap-3">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] p-1.5"
        >
          {icon ??
            getStateIcon(
              state
            )}
        </div>

        <div className="grid min-w-0 gap-1">
          {title && (
            <ToastTitle>
              {title}
            </ToastTitle>
          )}

          {description && (
            <ToastDescription>
              {description}
            </ToastDescription>
          )}

          {/*
           * A toast with no custom action gets its own dismiss action when
           * it is dismissible. This is independent of stack size.
           */}
          {visibleActions.length ===
              0 &&
            !action &&
            canDismiss && (
              <ToastButton
                variant="outlined"
                htmlType="button"
                size="sm"
                className="mt-1 h-7 justify-self-start px-2 text-xs"
                onClick={() =>
                  dismissToast(id)
                }
              >
                Dismiss
              </ToastButton>
            )}

          {visibleActions.length >
              0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {visibleActions.map(
                  ([buttonName, convey, destination], actionIndex) => (
                    <ToastButton
                      key={`${buttonName}-${actionIndex}`}
                      variant={
                        visibleActions.length === 1 || actionIndex === 1
                          ? 'outlined'
                          : 'tinted'
                      }
                      convey={convey}
                      htmlType="button"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        if (destination === 'dismiss') {
                          dismissToast(id)
                          return
                        }

                        window.location.assign(destination)
                      }}
                    >
                      {buttonName}
                    </ToastButton>
                  )
                )}
              </div>
            )}

          {isFront &&
            visibleActions.length === 0 &&
            action && (
              <div className="flex items-center pt-1">
                {action}
              </div>
            )}
        </div>
      </div>

      {/*
       * Cross button.
       */}
      {isFront &&
        canDismiss && (
          <ToastClose
            onClick={() =>
              dismissToast(
                id
              )
            }
          />
        )}

      {/*
       * Progress.
       *
       * This animation is also restarted whenever
       * a toast becomes front.
       */}
      {isFront &&
        !isExiting &&
        typeof dismissAfter ===
          'number' &&
        dismissAfter > 0 && (
          <div
            data-toast-progress="true"
            role="progressbar"
            aria-label="Toast dismiss countdown"
            aria-valuemin={0}
            aria-valuemax={dismissAfter}
            className={cn(
              'pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1 origin-left',
              state === 'success' && 'bg-emerald-500',
              state === 'warning' && 'bg-orange-500',
              (state === 'error' || state === 'danger' || variant === 'destructive') && 'bg-red-500',
              (!state || state === 'info') && variant !== 'destructive' && 'bg-slate-400',
            )}
            style={{
              animation: `neup-toast-progress ${dismissAfter}s linear forwards`,
            }}
          />
        )}
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Toast stack
|--------------------------------------------------------------------------
*/

type ToastStackProps = {
  name: string

  group: ToasterToast[]

  dismissToast: (
    id: string
  ) => void
}

function ToastStack({
  name,
  group,
  dismissToast,
}: ToastStackProps) {
  const visible =
    group.slice(
      0,
      MAX_VISIBLE
    )

  return (
    <div
      data-toast-stack={
        name
      }
      className={cn(
        /*
         * This is the trick.
         *
         * Every VisualToast is placed at:
         *
         * grid-column 1
         * grid-row 1
         *
         * so they physically overlap.
         */
        'grid w-full grid-cols-1 justify-items-center',

        /*
         * Space for back-card peeks.
         */
        group.length > 1 &&
          'pb-5'
      )}
    >
      {visible.map(
        (
          toast,
          index
        ) => (
          <VisualToast
            key={toast.id}
            toast={toast}
            index={index}
            dismissToast={
              dismissToast
            }
          />
        )
      )}
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Toaster
|--------------------------------------------------------------------------
*/

export function Toaster() {
  const {
    toasts,
    dismiss,
  } = useToast()

  /*
   * --------------------------------------------------------------
   * Group by toast.name only. A toast's dismissal settings do not create a
   * separate stack.
   * --------------------------------------------------------------
   *
   * useToast inserts newest toast first.
   *
   * Therefore this preserves:
   *
   * newest
   * previous
   * older
   */
  const groups =
    React.useMemo(() => {
      const map =
        new Map<
          string,
          ToasterToast[]
        >()

      for (const toast of toasts) {
        const current =
          map.get(
            toast.name
          ) ?? []

        current.push(
          toast
        )

        map.set(
          toast.name,
          current
        )
      }

      return Array.from(
        map.entries()
      )
    }, [toasts])

  return (
    <>
      {/*
       * ------------------------------------------------------------
       * Animation definitions
       * ------------------------------------------------------------
       *
       * Kept locally so there is no need to modify
       * globals.css or tailwind.config.
       */}
      <style>{`
        @keyframes neup-toast-enter {
          0% {
            opacity: 0;
            transform: translate3d(115%, 0, 0) scale(0.98);
          }

          65% {
            opacity: 1;
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes neup-toast-progress {
          from {
            transform: scaleX(1);
          }

          to {
            transform: scaleX(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-toast-stack] > * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <ToastViewport>
        {groups.map(
          ([
            name,
            group,
          ]) => (
            <ToastStack
              key={name}
              name={name}
              group={group}
              dismissToast={(
                id
              ) =>
                dismiss(
                  id
                )
              }
            />
          )
        )}
      </ToastViewport>
    </>
  )
}

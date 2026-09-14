"use client"
import type { ToastInput as NeupToastInput } from "@neup/core/hooks/useToast"
import { useToast as useNeupToast, toast as neupToast } from "@neup/core/hooks/useToast"

type LegacyToastInput = Omit<NeupToastInput, "name" | "state" | "convey"> & {
  variant?: "default" | "destructive"
  state?: "info" | "warning" | "error" | "danger" | "success"
  convey?: NeupToastInput["convey"]
  name?: string
}

function normalizeToast(input: LegacyToastInput): NeupToastInput {
  const { variant, name = "default", ...props } = input
  const convey = input.convey ?? (variant === "destructive" ? "danger" : undefined)
  const state = input.state ?? (variant === "destructive" ? "error" : "info")
  return { ...props, name, state, convey }
}

export function toast(input: LegacyToastInput) { return neupToast(normalizeToast(input)) }
export function useToast() { return { ...useNeupToast(), toast } }

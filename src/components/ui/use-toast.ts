"use client";

import { useCallback } from "react";
import { useToastContext } from "./toast-provider";

export function useToast() {
  const { push, dismiss } = useToastContext();

  const toast = useCallback(
    (options: { title?: string; description?: string, variant?: "default" | "destructive" }) => {
      push({
        ...options,
      });
    },
    [push]
  );

  return { toast, dismiss };
}

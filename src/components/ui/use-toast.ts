"use client";

import { useCallback } from "react";
import { useToastContext } from "./toast-provider";

export function useToast() {
  const { push, dismiss } = useToastContext();

  const toast = useCallback(
    (options: { title?: string; description?: string }) => {
      push(options);
    },
    [push]
  );

  return { toast, dismiss };
}

import { useCallback, useRef, useState } from "react";

/**
 * Wraps navigator.clipboard.writeText with a transient "what was just
 * copied" key, so callers can show "Copied" feedback next to whichever
 * specific button triggered it without each one managing its own timer.
 */
export function useClipboardFeedback(resetDelayMs = 1500) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const copy = useCallback(
    async (text: string, key: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setCopiedKey(null), resetDelayMs);
        return true;
      } catch {
        setCopiedKey(null);
        return false;
      }
    },
    [resetDelayMs],
  );

  return { copy, copiedKey };
}

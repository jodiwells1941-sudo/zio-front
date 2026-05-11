import { useEffect, useState } from "react";

function parseExpiryMs(value: string): number {
  const direct = new Date(value).getTime();
  if (!Number.isNaN(direct)) return direct;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return new Date(normalized).getTime();
}

/**
 * Counts down to expiresAt while `active` is true. Used for payment / release windows.
 */
export function useExpiryTimer(expiresAt: string | null, active: boolean) {
  const calcSeconds = (): number => {
    if (!expiresAt) return 0;
    const expiresAtMs = parseExpiryMs(expiresAt);
    if (Number.isNaN(expiresAtMs)) return 0;
    return Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    setSecondsLeft(calcSeconds());
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt || !active) return;
    const interval = setInterval(() => {
      const remaining = calcSeconds();
      setSecondsLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [active, expiresAt]);

  const expired = !!expiresAt && secondsLeft <= 0;

  return {
    secondsLeft,
    mm: Math.floor(secondsLeft / 60),
    ss: secondsLeft % 60,
    expired,
    pending: !expiresAt,
  };
}

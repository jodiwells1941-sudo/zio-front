import { useState, useEffect, useCallback } from "react";

export function useCountUp(start: number, interval: number = 3000, resetAfter?: number) {
  const [count, setCount] = useState(start);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setCount(start);

    const timer = setInterval(() => {
      setCount((prev) => {
        const intPart = Math.floor(prev);
        const decimalDigit = Math.round((prev - intPart) * 10);

        if (decimalDigit >= 9) {
          return intPart + 1 + 0.1;
        } else {
          return parseFloat((intPart + (decimalDigit + 1) / 10).toFixed(1));
        }
      });
    }, interval);

    return () => clearInterval(timer);
  }, [start, interval, key]);

  // Auto reset after X milliseconds
  useEffect(() => {
    if (!resetAfter) return;
    const timeout = setTimeout(() => {
      setKey((k) => k + 1);
    }, resetAfter);
    return () => clearTimeout(timeout);
  }, [resetAfter, key]); // key re-triggers the reset loop

  const reset = useCallback(() => setKey((k) => k + 1), []);

  return { count, reset };
}
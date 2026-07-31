import { useCallback, useEffect, useRef, useState } from "react";

export function useFlashMessage(duration = 3000) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback(
    (text: string) => {
      setMessage(text);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(null), duration);
    },
    [duration]
  );

  const clear = useCallback(() => {
    setMessage(null);
    clearTimeout(timer.current);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { message, show, clear };
}

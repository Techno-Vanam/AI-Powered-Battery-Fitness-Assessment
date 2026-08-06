import { useCallback, useEffect, useRef, useState } from 'react';
import { openDatabase } from '../database/database';

export function useSplashScreenViewModel(onReady: () => void) {
  const [statusText, setStatusText] = useState('Loading…');
  const [isDone, setIsDone] = useState(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    let mounted = true;
    let navigateTimer: ReturnType<typeof setTimeout> | null = null;

    async function init() {
      try {
        if (mounted) setStatusText('Preparing your data…');
        await openDatabase();

        if (mounted) setStatusText('Almost ready…');
        await new Promise<void>(resolve => setTimeout(resolve, 600));

        if (!mounted) return;

        setStatusText('Welcome');
        setIsDone(true);
        navigateTimer = setTimeout(() => {
          if (mounted) onReadyRef.current();
        }, 400);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (mounted) setStatusText(`Init Error: ${message}`);
      }
    }

    init();

    return () => {
      mounted = false;
      if (navigateTimer) clearTimeout(navigateTimer);
    };
  }, []);

  return { statusText, isDone };
}

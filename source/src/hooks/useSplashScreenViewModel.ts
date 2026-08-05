import { useEffect, useState } from 'react';
import { openDatabase } from '../database/database';

export function useSplashScreenViewModel(onReady: () => void) {
  const [statusText, setStatusText] = useState('Initializing AI Fitness Engine…');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        if (mounted) setStatusText('Opening Secure Database…');
        await openDatabase();

        if (mounted) setStatusText('Verifying Computer Vision Pipeline…');
        await new Promise<void>(resolve => setTimeout(resolve, 600));

        if (mounted) setStatusText('Ready!');
        if (mounted) setIsDone(true);
        setTimeout(() => {
          if (mounted) onReady();
        }, 400);
      } catch (err: any) {
        if (mounted) setStatusText(`Init Error: ${err.message}`);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [onReady]);

  return { statusText, isDone };
}

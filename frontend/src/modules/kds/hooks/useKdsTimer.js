import { useState, useEffect } from 'react';

export function useKdsTimer(startTime) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    
    const update = () => {
      const now = Date.now();
      const diffInSeconds = Math.floor((now - start) / 1000);
      setElapsed(diffInSeconds);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isDelayed = elapsed > 600; // 10 minutes

  return { elapsed, formatTime: formatTime(elapsed), isDelayed };
}

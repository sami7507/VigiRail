/** Returns a live HH:MM:SS string that updates every second. */
import { useState, useEffect } from 'react';

export function useClock() {
  const fmt = () =>
    new Date().toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const [time, setTime] = useState(fmt());
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function useDate() {
  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

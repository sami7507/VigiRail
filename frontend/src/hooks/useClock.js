/** Live HH:MM:SS clock (device locale) + current date string. */
import { useEffect, useState } from 'react';

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function useClock() {
  const [time, setTime] = useState(() => timeFormatter.format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTime(timeFormatter.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function useDate() {
  return dateFormatter.format(new Date());
}

/** Browser connectivity — drives the offline banner. */
export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);
  return online;
}

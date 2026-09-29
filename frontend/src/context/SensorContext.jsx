/**
 * VigiRail — live telemetry context.
 *
 * Polls GET /api/sensor-data every 2 s for the selected train.
 * Polling pauses while the tab is hidden (battery + backend friendly) and
 * resumes immediately on refocus — important for the installed PWA.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TRAIN_KEY, errMsg, fetchSensorData, toggleSimulate } from '../lib/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SensorContext = createContext(null);
const POLL_MS = 2000;

export function SensorProvider({ children }) {
  const { user } = useAuth();
  const { push } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [events, setEvents] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [selectedTrain, setSelectedTrainState] = useState(
    () => localStorage.getItem(TRAIN_KEY) || '12951'
  );
  const timerRef = useRef(null);
  const busyRef = useRef(false);
  const errorToastShown = useRef(false);
  const lastStateRef = useRef(null);

  const addEvent = useCallback((text, tone = 'neutral') => {
    const ts = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setEvents((prev) => [{ id: `${Date.now()}-${Math.random()}`, ts, text, tone }, ...prev].slice(0, 80));
  }, []);

  const poll = useCallback(async () => {
    if (!user || busyRef.current) return;
    busyRef.current = true;
    const started = performance.now();
    try {
      const snapshot = await fetchSensorData(selectedTrain);
      setLatency(Math.round(performance.now() - started));
      setData(snapshot);
      setError(null);
      errorToastShown.current = false;
      setUpdateCount((count) => count + 1);

      // Edge-triggered event log: only record state *transitions*.
      if (snapshot.state !== lastStateRef.current) {
        const previous = lastStateRef.current;
        lastStateRef.current = snapshot.state;
        if (snapshot.state === 'danger') {
          addEvent(
            `CRITICAL — vib ${snapshot.sensors.vibration} mm/s · temp ${snapshot.sensors.temperature}°C on train ${snapshot.train_id}`,
            'danger'
          );
        } else if (snapshot.state === 'warn') {
          addEvent(`Advisory — readings elevated on train ${snapshot.train_id}`, 'warn');
        } else if (previous) {
          addEvent(`Recovered — train ${snapshot.train_id} back to normal`, 'ok');
        } else {
          addEvent(`Telemetry online — train ${snapshot.train_id}`, 'ok');
        }
      }
    } catch (err) {
      const message = errMsg(err, 'API unreachable');
      setError(message);
      if (!errorToastShown.current) {
        errorToastShown.current = true;
        push({ type: 'error', title: 'Connection lost', message });
      }
    } finally {
      busyRef.current = false;
    }
  }, [user, selectedTrain, addEvent, push]);

  // Polling loop — skipped while the document is hidden.
  useEffect(() => {
    if (!user) return undefined;
    const tick = () => {
      if (!document.hidden) poll();
    };
    tick();
    timerRef.current = setInterval(tick, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [poll, user]);

  const selectTrain = useCallback(
    (trainNo) => {
      setSelectedTrainState(trainNo);
      localStorage.setItem(TRAIN_KEY, trainNo);
      addEvent(`Switched monitoring to train ${trainNo}`);
    },
    [addEvent]
  );

  const handleSimulate = useCallback(
    async (failure) => {
      try {
        const result = await toggleSimulate(failure);
        setSimulating(failure);
        addEvent(failure ? 'Failure simulation engaged' : 'System reset to normal', failure ? 'danger' : 'ok');
        push({
          type: failure ? 'warn' : 'success',
          title: result.message,
          message: failure ? 'Sensor stream is now ramping into the danger zone.' : 'Telemetry back to baseline.',
        });
        await poll();
        return true;
      } catch (err) {
        push({ type: 'error', title: 'Simulation toggle failed', message: errMsg(err) });
        return false;
      }
    },
    [addEvent, push, poll]
  );

  const value = useMemo(
    () => ({
      data,
      error,
      latency,
      updateCount,
      events,
      addEvent,
      simulating,
      handleSimulate,
      selectedTrain,
      selectTrain,
      refresh: poll,
    }),
    [data, error, latency, updateCount, events, addEvent, simulating, handleSimulate, selectedTrain, selectTrain, poll]
  );

  return <SensorContext.Provider value={value}>{children}</SensorContext.Provider>;
}

export const useSensor = () => useContext(SensorContext);

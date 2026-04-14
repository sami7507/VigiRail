/**
 * RailGuard AI — Sensor Data Context
 * Polls /api/sensor-data every 2 seconds and distributes data
 * to all consuming components via context.
 */
import React, {
  createContext, useContext, useState,
  useEffect, useRef, useCallback,
} from 'react';
import { fetchSensorData, toggleSimulate } from '../utils/api';
import { useAuth } from './AuthContext';

const SensorContext = createContext(null);

export function SensorProvider({ children }) {
  const { user } = useAuth();
  const [data,        setData]        = useState(null);
  const [error,       setError]       = useState(null);
  const [simMode,     setSimMode]     = useState(false);
  const [selectedTrain, setSelectedTrain] = useState('12951');
  const [updateCount, setUpdateCount] = useState(0);
  const [alertCount,  setAlertCount]  = useState(0);
  const [events,      setEvents]      = useState([]);
  const timerRef = useRef(null);

  const poll = useCallback(async () => {
    if (!user) return;
    try {
      const d = await fetchSensorData(selectedTrain);
      setData(d);
      setError(null);
      setUpdateCount(c => c + 1);
      if (d.state === 'danger') setAlertCount(c => c + 1);
      const ts  = new Date().toLocaleTimeString('en-IN', { hour12: true });
      const txt = d.state === 'danger'
        ? `🚨 Vib=${d.sensors.vibration}mm/s Temp=${d.sensors.temperature}°C — CRITICAL`
        : `✅ Scan OK — ${d.train_id}`;
      setEvents(prev => [{ ts, txt }, ...prev].slice(0, 60));
    } catch (e) {
      setError('Backend unreachable. Check if server is running on port 8000.');
    }
  }, [user, selectedTrain]);

  useEffect(() => {
    if (!user) return;
    poll();
    timerRef.current = setInterval(poll, 2000);
    return () => clearInterval(timerRef.current);
  }, [poll, user]);

  const handleSimulate = async (failure) => {
    await toggleSimulate(failure);
    setSimMode(failure);
    if (!failure) setAlertCount(0);
    const ts  = new Date().toLocaleTimeString('en-IN', { hour12: true });
    const txt = failure ? '🔴 FAILURE SIMULATION started' : '✅ System reset to normal';
    setEvents(prev => [{ ts, txt }, ...prev].slice(0, 60));
  };

  return (
    <SensorContext.Provider value={{
      data, error, simMode, selectedTrain, setSelectedTrain,
      updateCount, alertCount, events, handleSimulate,
    }}>
      {children}
    </SensorContext.Provider>
  );
}

export const useSensor = () => useContext(SensorContext);

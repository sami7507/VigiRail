/**
 * useSensorData.js — v2
 * Polls /api/sensor-data every 2 seconds.
 * Now returns train info, route health, and current station too.
 */
import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8000';

export function useSensorData() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/sensor-data`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError('Cannot reach backend. Is the server running on port 8000?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 2000);
    return () => clearInterval(id);
  }, [fetchData]);

  const triggerSimulate = async (failure) => {
    try {
      await fetch(`${API_BASE}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ failure }),
      });
      await fetchData();
    } catch (e) {
      console.error('Simulate toggle failed:', e);
    }
  };

  return { data, loading, error, triggerSimulate };
}

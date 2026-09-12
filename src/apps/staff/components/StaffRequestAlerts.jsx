import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getPendingAppointmentRequests } from '../lib/database';

export const STAFF_REQUEST_POLL_INTERVAL_MS = 60_000;
export const STAFF_REQUEST_COUNT_LIMIT = 99;
export const STAFF_REQUEST_SOUND_STORAGE_KEY = 'gh:staff-request-sound-enabled';

const StaffRequestAlertsContext = createContext(null);

const requestKey = (request) => `${request.request_kind || 'structured'}:${request.id}`;

function readSoundPreference() {
  try {
    return window.localStorage.getItem(STAFF_REQUEST_SOUND_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function StaffRequestAlertsProvider({
  enabled,
  children,
  pollIntervalMs = STAFF_REQUEST_POLL_INTERVAL_MS,
}) {
  const [pendingCount, setPendingCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(readSoundPreference);
  const knownRequestKeysRef = useRef(new Set());
  const initializedRef = useRef(false);
  const inFlightRef = useRef(false);
  const soundEnabledRef = useRef(soundEnabled);
  const audioContextRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioContextRef.current = new AudioContext();
    return audioContextRef.current;
  }, []);

  const unlockSound = useCallback(() => {
    const context = getAudioContext();
    if (context?.state === 'suspended') context.resume().catch(() => {});
  }, [getAudioContext]);

  const playRequestSound = useCallback(() => {
    const context = getAudioContext();
    if (!context) return;

    const play = () => {
      const start = context.currentTime;
      [659.25, 783.99].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const toneStart = start + index * 0.16;
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, toneStart);
        gain.gain.setValueAtTime(0.0001, toneStart);
        gain.gain.exponentialRampToValueAtTime(0.12, toneStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, toneStart + 0.14);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(toneStart);
        oscillator.stop(toneStart + 0.15);
      });
    };

    if (context.state === 'suspended') {
      context.resume().then(play).catch(() => {});
      return;
    }
    play();
  }, [getAudioContext]);

  const setSoundPreference = useCallback((nextValue) => {
    const next = Boolean(nextValue);
    soundEnabledRef.current = next;
    setSoundEnabled(next);
    try {
      window.localStorage.setItem(STAFF_REQUEST_SOUND_STORAGE_KEY, String(next));
    } catch {
      // The preference still applies for this session when storage is unavailable.
    }
    if (next) unlockSound();
  }, [unlockSound]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    const unlock = () => unlockSound();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [enabled, unlockSound]);

  useEffect(() => {
    let disposed = false;
    let intervalId = null;
    let initialTimerId = null;

    const clearPolling = () => {
      if (intervalId !== null) window.clearInterval(intervalId);
      intervalId = null;
    };

    const poll = async () => {
      if (disposed || !enabled || document.visibilityState === 'hidden' || inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        const requests = await getPendingAppointmentRequests();
        if (disposed || document.visibilityState === 'hidden') return;

        const nextKeys = new Set((requests || []).map(requestKey));
        const hasNewRequest = initializedRef.current
          && [...nextKeys].some((key) => !knownRequestKeysRef.current.has(key));
        const nextCount = requests?.length || 0;

        knownRequestKeysRef.current = nextKeys;
        initializedRef.current = true;
        setPendingCount(nextCount);

        if (hasNewRequest && soundEnabledRef.current) playRequestSound();
      } catch {
        // Network failures leave the last reliable count untouched and stay silent.
      } finally {
        inFlightRef.current = false;
      }
    };

    const startPolling = () => {
      if (disposed || !enabled || document.visibilityState === 'hidden') return;
      void poll();
      if (intervalId === null) intervalId = window.setInterval(poll, pollIntervalMs);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clearPolling();
        return;
      }
      startPolling();
    };

    if (!enabled) {
      initializedRef.current = false;
      knownRequestKeysRef.current = new Set();
      setPendingCount(0);
      return undefined;
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    initialTimerId = window.setTimeout(startPolling, 0);

    return () => {
      disposed = true;
      if (initialTimerId !== null) window.clearTimeout(initialTimerId);
      clearPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      inFlightRef.current = false;
    };
  }, [enabled, playRequestSound, pollIntervalMs]);

  const value = useMemo(() => ({
    pendingCount,
    soundEnabled,
    setSoundEnabled: setSoundPreference,
  }), [pendingCount, setSoundPreference, soundEnabled]);

  return (
    <StaffRequestAlertsContext.Provider value={value}>
      {children}
    </StaffRequestAlertsContext.Provider>
  );
}

export function useStaffRequestAlerts() {
  return useContext(StaffRequestAlertsContext) || {
    pendingCount: 0,
    soundEnabled: true,
    setSoundEnabled: () => {},
  };
}

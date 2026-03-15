import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface DiaryEntry {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // seconds
  biteCount: number;
  biteTimestamps: number[];
  interruptions: number;
  avgBiteInterval: number; // seconds
  focusScore: number; // 0-100
  satiety: number; // 1-5
  mood: string; // emoji
  note: string;
  photo?: string;
  waterCount?: number;
}

export interface AvatarConfig {
  hairStyle: number;    // 0-5
  hairColor: string;
  skinTone: string;
  outfitStyle: number;  // 0-5
  outfitColor: string;
  accessory: number;    // 0-4 (none, glasses, bow, earring, hat)
  bgColor: string;
  uploadedImage?: string; // base64 data URL
}

export interface UserSettings {
  avatarConfig: AvatarConfig;
  biteInterval: number; // seconds 12-20
  soundEnabled: boolean;
  lockScreenMode: boolean;
  userName: string;
}

export interface SessionData {
  startTime: number;
  biteTimestamps: number[];
  interruptions: number;
  isPaused: boolean;
  pauseStart?: number;
  totalPausedTime: number;
  photo?: string;
  waterCount: number;
}

interface StoreContextType {
  entries: DiaryEntry[];
  settings: UserSettings;
  currentSession: SessionData | null;
  addEntry: (entry: DiaryEntry) => void;
  deleteEntry: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  startSession: (photo?: string) => void;
  endSession: () => SessionData | null;
  pauseSession: () => void;
  resumeSession: () => void;
  addBite: () => void;
  addInterruption: () => void;
  addWater: () => void;
  setSessionPhoto: (photo: string) => void;
  todayCount: number;
  lastDuration: number | null;
}

const defaultAvatarConfig: AvatarConfig = {
  hairStyle: 0,
  hairColor: "#5C3A1E",
  skinTone: "#F5D5C0",
  outfitStyle: 0,
  outfitColor: "#C4856C",
  accessory: 0,
  bgColor: "#B8C9E8",
};

const defaultSettings: UserSettings = {
  avatarConfig: defaultAvatarConfig,
  biteInterval: 15,
  soundEnabled: true,
  lockScreenMode: false,
  userName: "",
};

const StoreContext = createContext<StoreContextType | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    // Migrate old settings that had avatarStyle instead of avatarConfig
    if (key === "sloweat_settings" && parsed && !parsed.avatarConfig) {
      return { ...fallback as any, ...parsed, avatarConfig: defaultAvatarConfig } as T;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<DiaryEntry[]>(() =>
    loadFromStorage("sloweat_entries", [])
  );
  const [settings, setSettings] = useState<UserSettings>(() =>
    loadFromStorage("sloweat_settings", defaultSettings)
  );
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);

  useEffect(() => {
    localStorage.setItem("sloweat_entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("sloweat_settings", JSON.stringify(settings));
  }, [settings]);

  const addEntry = useCallback((entry: DiaryEntry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const startSession = useCallback((photo?: string) => {
    setCurrentSession({
      startTime: Date.now(),
      biteTimestamps: [],
      interruptions: 0,
      isPaused: false,
      totalPausedTime: 0,
      photo,
      waterCount: 0,
    });
  }, []);

  const endSession = useCallback(() => {
    const session = currentSession;
    setCurrentSession(null);
    return session;
  }, [currentSession]);

  const pauseSession = useCallback(() => {
    setCurrentSession((prev) =>
      prev ? { ...prev, isPaused: true, pauseStart: Date.now() } : null
    );
  }, []);

  const resumeSession = useCallback(() => {
    setCurrentSession((prev) => {
      if (!prev || !prev.pauseStart) return prev;
      const pausedTime = Date.now() - prev.pauseStart;
      return {
        ...prev,
        isPaused: false,
        pauseStart: undefined,
        totalPausedTime: prev.totalPausedTime + pausedTime,
        interruptions: prev.interruptions + 1,
      };
    });
  }, []);

  const addBite = useCallback(() => {
    setCurrentSession((prev) =>
      prev
        ? { ...prev, biteTimestamps: [...prev.biteTimestamps, Date.now()] }
        : null
    );
  }, []);

  const addInterruption = useCallback(() => {
    setCurrentSession((prev) =>
      prev ? { ...prev, interruptions: prev.interruptions + 1 } : null
    );
  }, []);

  const addWater = useCallback(() => {
    setCurrentSession((prev) =>
      prev ? { ...prev, waterCount: prev.waterCount + 1 } : null
    );
  }, []);

  const setSessionPhoto = useCallback((photo: string) => {
    setCurrentSession((prev) =>
      prev ? { ...prev, photo } : null
    );
  }, []);

  const today = new Date().toDateString();
  const todayCount = entries.filter(
    (e) => new Date(e.startTime).toDateString() === today
  ).length;

  const lastDuration = entries.length > 0 ? entries[0].duration : null;

  return (
    <StoreContext.Provider
      value={{
        entries,
        settings,
        currentSession,
        addEntry,
        deleteEntry,
        updateSettings,
        startSession,
        endSession,
        pauseSession,
        resumeSession,
        addBite,
        addInterruption,
        addWater,
        setSessionPhoto,
        todayCount,
        lastDuration,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
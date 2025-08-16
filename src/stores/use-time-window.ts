import { create } from "zustand";

export const TIME_WINDOWS = {
  "2W": { days: 14, description: "Past 2 Weeks" },
  "1M": { days: 30, description: "Past Month" },
  "3M": { days: 90, description: "Past 3 Months" },
  "6M": { days: 180, description: "Past 6 Months" },
  ALL: { days: -1, description: "All Time" },
};

interface TimeWindowStore {
  timeWindow: keyof typeof TIME_WINDOWS;
  setTimeWindow: (timeWindow: keyof typeof TIME_WINDOWS) => void;
}

export const useTimeWindow = create<TimeWindowStore>((set) => ({
  timeWindow: "2W",
  setTimeWindow: (timeWindow) => set({ timeWindow }),
}));

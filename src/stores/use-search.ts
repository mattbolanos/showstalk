import { create } from "zustand";

interface SearchStore {
  searchOpen: boolean;
  setSearchOpen: (searchOpen: boolean) => void;
}

export const useSearch = create<SearchStore>((set) => ({
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
}));

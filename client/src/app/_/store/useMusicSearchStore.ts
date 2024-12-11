import { create } from "zustand";

type MusicSearchStore = {
  search: string;
  setSearch: (value: string) => void;
};

export const useMusicSearchStore = create<MusicSearchStore>((set) => ({
  search: "",
  setSearch: (value) => set({ search: value }),
}));

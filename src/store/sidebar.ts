import { create } from "zustand";

interface SidebarStore {
    isOpen: boolean;
    isCollapsed: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    toggleCollapse: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
    isOpen: false,
    isCollapsed: true,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));

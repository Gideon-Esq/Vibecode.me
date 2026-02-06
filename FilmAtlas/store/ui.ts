import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isSearchOpen: boolean;
  toggleSidebar: () => void;
  toggleSearch: () => void;
  closeSidebar: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isSearchOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
}));

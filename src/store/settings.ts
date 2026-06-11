import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
    hasHydrated: boolean;
    enablePomodoro: boolean;
    enableHighEnergySession: boolean;
    showHistoryView: boolean;
    showAvailabilityRibbon: boolean;
    enableAnalytics: boolean;
    enableInsights: boolean;
    setHasHydrated: (hydrated: boolean) => void;
    setEnablePomodoro: (enabled: boolean) => void;
    setEnableHighEnergySession: (enabled: boolean) => void;
    setShowHistoryView: (enabled: boolean) => void;
    setShowAvailabilityRibbon: (enabled: boolean) => void;
    setEnableAnalytics: (enabled: boolean) => void;
    setEnableInsights: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            hasHydrated: false,
            enablePomodoro: true,
            enableHighEnergySession: true,
            showHistoryView: true,
            showAvailabilityRibbon: true,
            enableAnalytics: true,
            enableInsights: true,
            setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
            setEnablePomodoro: (enabled) => set({ enablePomodoro: enabled }),
            setEnableHighEnergySession: (enabled) => set({ enableHighEnergySession: enabled }),
            setShowHistoryView: (enabled) => set({ showHistoryView: enabled }),
            setShowAvailabilityRibbon: (enabled) => set({ showAvailabilityRibbon: enabled }),
            setEnableAnalytics: (enabled) => set({ enableAnalytics: enabled }),
            setEnableInsights: (enabled) => set({ enableInsights: enabled }),
        }),
        {
            name: "focusos-settings-preferences",
            partialize: (state) => ({
                enablePomodoro: state.enablePomodoro,
                enableHighEnergySession: state.enableHighEnergySession,
                showHistoryView: state.showHistoryView,
                showAvailabilityRibbon: state.showAvailabilityRibbon,
                enableAnalytics: state.enableAnalytics,
                enableInsights: state.enableInsights,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

export function useSettings() {
    const store = useSettingsStore();

    return {
        enablePomodoro: store.hasHydrated ? store.enablePomodoro : true,
        enableHighEnergySession: store.hasHydrated ? store.enableHighEnergySession : true,
        showHistoryView: store.hasHydrated ? store.showHistoryView : true,
        showAvailabilityRibbon: store.hasHydrated ? store.showAvailabilityRibbon : true,
        enableAnalytics: store.hasHydrated ? store.enableAnalytics : true,
        enableInsights: store.hasHydrated ? store.enableInsights : true,
        setEnablePomodoro: store.setEnablePomodoro,
        setEnableHighEnergySession: store.setEnableHighEnergySession,
        setShowHistoryView: store.setShowHistoryView,
        setShowAvailabilityRibbon: store.setShowAvailabilityRibbon,
        setEnableAnalytics: store.setEnableAnalytics,
        setEnableInsights: store.setEnableInsights,
        mounted: store.hasHydrated,
    };
}

import { create } from "zustand";

type CalendarViewMode = "timeGridDay" | "timeGridWeek" | "dayGridMonth";

interface ProjectFilters {
    tag: string;
    status: string;
    difficulty: string;
    hasTimer: boolean;
}

interface LayoutState {
    // Calendar View Mode
    calendarViewMode: CalendarViewMode;
    setCalendarViewMode: (mode: CalendarViewMode) => void;

    // Calendar Commands (Today, Prev, Next)
    calendarCommand: "today" | "prev" | "next" | null;
    setCalendarCommand: (command: "today" | "prev" | "next") => void;
    clearCalendarCommand: () => void;
    
    // Project View Mode Tracking
    projectViewMode: "board" | "list";
    setProjectViewMode: (mode: "board" | "list") => void;
    
    // Project Header Commands (for synced actions like edit/delete)
    projectCommand: "edit" | "delete" | null;
    setProjectCommand: (command: "edit" | "delete") => void;
    clearProjectCommand: () => void;

    // Page Padding Control
    isNoPadding: boolean;
    setNoPadding: (isNoPadding: boolean) => void;

    // Calendar Zoom (1-4)
    calendarZoom: number;
    setCalendarZoom: (zoom: number) => void;

    // Extensible Header Configuration
    headerConfig: {
        title?: string | React.ReactNode;
        showBackButton?: boolean;
        actions?: React.ReactNode;
    } | null;
    setHeaderConfig: (config: {
        title?: string | React.ReactNode;
        showBackButton?: boolean;
        actions?: React.ReactNode;
    } | null) => void;

    // Command Capture Visibility
    isCommandCaptureOpen: boolean;
    setCommandCaptureOpen: (open: boolean) => void;

    // Energy Mode
    lowEnergyMode: boolean;
    setLowEnergyMode: (enabled: boolean) => void;

    // Project Filters
    projectFilters: ProjectFilters;
    setProjectFilters: (filters: Partial<ProjectFilters>) => void;
    resetProjectFilters: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
    calendarViewMode: "dayGridMonth",
    setCalendarViewMode: (mode) => set({ calendarViewMode: mode }),
    
    calendarCommand: null,
    setCalendarCommand: (command) => set({ calendarCommand: command }),
    clearCalendarCommand: () => set({ calendarCommand: null }),

    calendarZoom: 2,
    setCalendarZoom: (zoom) => set({ calendarZoom: zoom }),

    headerConfig: null,
    setHeaderConfig: (config) => set({ headerConfig: config }),

    projectViewMode: "board",
    setProjectViewMode: (mode) => set({ projectViewMode: mode }),

    projectCommand: null,
    setProjectCommand: (command) => set({ projectCommand: command }),
    clearProjectCommand: () => set({ projectCommand: null }),

    isNoPadding: false,
    setNoPadding: (isNoPadding) => set({ isNoPadding }),

    isCommandCaptureOpen: false,
    setCommandCaptureOpen: (open) => set({ isCommandCaptureOpen: open }),

    lowEnergyMode: false,
    setLowEnergyMode: (enabled) => set({ lowEnergyMode: enabled }),

    projectFilters: {
        tag: "ALL",
        status: "ALL",
        difficulty: "ALL",
        hasTimer: false,
    },
    setProjectFilters: (filters) => set((state) => ({
        projectFilters: { ...state.projectFilters, ...filters }
    })),
    resetProjectFilters: () => set({
        projectFilters: {
            tag: "ALL",
            status: "ALL",
            difficulty: "ALL",
            hasTimer: false,
        }
    }),
}));

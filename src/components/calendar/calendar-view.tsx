"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight, CalendarClock } from "lucide-react";
import { useCalendarEvents, useUpdateCalendarEvent, type CalendarEvent } from "@/hooks/use-calendar";
import { CalendarEventPopover } from "./calendar-event-popover";
import { CalendarSlotModal } from "./calendar-slot-modal";
import { CalendarHeaderStats } from "./calendar-header-stats";
import { Button } from "@/components/ui/button";

export function CalendarView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calendarRef = React.useRef<any>(null);
    const [view, setView] = React.useState<"timeGridDay" | "timeGridWeek" | "dayGridMonth">("timeGridDay");
    const [zoomLevel, setZoomLevel] = React.useState<number>(2); // 1-4
    const [dateRange, setDateRange] = React.useState<{ start: string; end: string } | undefined>(undefined);
    const [plugins, setPlugins] = React.useState<any[]>([]);
    const [FCComponent, setFCComponent] = React.useState<React.ComponentType<any> | null>(null);
    const [now, setNow] = React.useState(new Date());

    // Update 'now' every minute to keep indicator label fresh
    React.useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const { data: events = [], isLoading } = useCalendarEvents(dateRange);
    const { mutate: updateEvent } = useUpdateCalendarEvent();

    // Popover state
    const [popover, setPopover] = React.useState<{
        event: CalendarEvent;
        position: { x: number; y: number };
    } | null>(null);

    // Slot modal state
    const [slotModal, setSlotModal] = React.useState<{ start: Date; end?: Date } | null>(null);

    // Load FullCalendar + plugins on client only (avoid SSR issues)
    React.useEffect(() => {
        Promise.all([
            import("@fullcalendar/react"),
            import("@fullcalendar/timegrid"),
            import("@fullcalendar/daygrid"),
            import("@fullcalendar/interaction"),
        ]).then(([fc, tg, dg, ia]) => {
            setFCComponent(() => fc.default);
            setPlugins([tg.default, dg.default, ia.default]);
        });
    }, []);

    // Convert API events to FullCalendar format
    const fcEvents = React.useMemo(() => {
        return events.map((e) => ({
            id: e.id,
            title: e.title,
            start: e.start,
            end: e.end,
            allDay: e.allDay,
            backgroundColor: e.task?.projectRef?.color || e.color || "#6366f1",
            borderColor: e.task?.projectRef?.color || e.color || "#6366f1",
            textColor: "#ffffff",
            extendedProps: { calendarEvent: e },
        }));
    }, [events]);

    const handleViewChange = (newView: "timeGridDay" | "timeGridWeek" | "dayGridMonth") => {
        setView(newView);
        calendarRef.current?.getApi().changeView(newView);
    };

    const handleZoom = (delta: number) => {
        setZoomLevel(prev => {
            const next = Math.min(Math.max(prev + delta, 1), 4);
            localStorage.setItem("focusos_calendar_zoom", next.toString());
            return next;
        });
    };

    const slotDuration = React.useMemo(() => {
        const durations = ["00:15:00", "00:30:00", "01:00:00", "02:00:00"];
        return durations[zoomLevel - 1];
    }, [zoomLevel]);

    const scrollTime = React.useMemo(() => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}:00`;
    }, []);

    React.useEffect(() => {
        const savedZoom = localStorage.getItem("focusos_calendar_zoom");
        if (savedZoom) setZoomLevel(parseInt(savedZoom, 10));
    }, []);

    const handlePrev = () => calendarRef.current?.getApi().prev();
    const handleNext = () => calendarRef.current?.getApi().next();
    const handleToday = () => calendarRef.current?.getApi().today();

    const handleDatesSet = (info: any) => {
        setDateRange({
            start: info.startStr,
            end: info.endStr,
        });
    };

    const handleEventClick = (info: any) => {
        const rect = info.el.getBoundingClientRect();
        const calEvent: CalendarEvent = info.event.extendedProps.calendarEvent;
        setPopover({
            event: calEvent,
            position: { x: rect.right + 8, y: rect.top },
        });
    };

    const handleDateClick = (info: any) => {
        if (!info.allDay) {
            setSlotModal({ start: info.date });
        }
    };

    const handleSelect = (info: any) => {
        if (!info.allDay) {
            setSlotModal({ start: info.start, end: info.end });
        }
    };

    const handleEventDrop = (info: any) => {
        updateEvent({
            id: info.event.id,
            start: info.event.startStr,
            end: info.event.endStr || info.event.startStr,
        });
    };

    const handleEventResize = (info: any) => {
        updateEvent({
            id: info.event.id,
            start: info.event.startStr,
            end: info.event.endStr,
        });
    };

    if (!FCComponent || plugins.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center space-y-2">
                    <CalendarDays className="h-8 w-8 mx-auto animate-pulse" />
                    <p className="text-sm">Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Page Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Calendar
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Plan your day and schedule deep work blocks.
                        </p>
                    </div>

                    {/* Nav controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={handleToday}>
                            Today
                        </Button>
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <button
                                onClick={handlePrev}
                                className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-l border-slate-200 dark:border-slate-700"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* View toggle */}
                        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 p-1 shadow-sm backdrop-blur-sm">
                            <button
                                onClick={() => handleViewChange("timeGridDay")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    view === "timeGridDay"
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <CalendarDays className="h-3.5 w-3.5" />
                                Day
                            </button>
                            <button
                                onClick={() => handleViewChange("timeGridWeek")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    view === "timeGridWeek"
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <CalendarClock className="h-3.5 w-3.5" />
                                Week
                            </button>
                            <button
                                onClick={() => handleViewChange("dayGridMonth")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    view === "dayGridMonth"
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <CalendarDays className="h-3.5 w-3.5" />
                                Month
                            </button>
                        </div>

                        {/* Zoom controls */}
                        <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handleZoom(-1)}
                                disabled={zoomLevel === 1}
                            >
                                -
                            </Button>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter w-8 text-center">
                                Zoom
                            </span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handleZoom(1)}
                                disabled={zoomLevel === 4}
                            >
                                +
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats bar */}
                {!isLoading && <CalendarHeaderStats events={events} />}
            </div>

            {/* Calendar */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[600px]">
                <style>{`
                    .fc { height: 100%; font-family: inherit; }
                    .fc-theme-standard td, .fc-theme-standard th { border-color: rgb(226 232 240 / 0.7); }
                    .dark .fc-theme-standard td, .dark .fc-theme-standard th { border-color: rgb(51 65 85 / 0.7); }
                    .fc-col-header-cell-cushion { font-weight: 600; font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                    .dark .fc-col-header-cell-cushion { color: #94a3b8; }
                    .fc-timegrid-slot-label { font-size: 0.7rem; color: #94a3b8; }
                    .fc-toolbar { display: none; }
                    .fc-event { border-radius: 6px !important; font-size: 0.75rem !important; font-weight: 600; cursor: pointer; transition: filter 0.15s; }
                    .fc-event:hover { filter: brightness(0.9); }
                    .fc-now-indicator-line { border-color: #ef4444 !important; border-width: 1px; }
                    .fc-now-indicator-arrow { display: none; }
                    .fc-timegrid-now-indicator-container { overflow: visible; }
                    .fc-now-indicator-content { position: relative; }
                    .fc-now-indicator-content::before {
                        content: '';
                        position: absolute;
                        left: -5px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 10px;
                        height: 10px;
                        background: #ef4444;
                        border-radius: 50%;
                        z-index: 10;
                        box-shadow: 0 0 0 2px white;
                    }
                    .fc-now-indicator-content::after {
                        content: attr(data-time);
                        position: absolute;
                        left: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                        font-size: 10px;
                        font-weight: 700;
                        color: #ef4444;
                        background: white;
                        padding: 0 4px;
                        border-radius: 4px;
                        white-space: nowrap;
                    }
                    .dark .fc-now-indicator-content::after {
                        background: rgb(15 23 42);
                    }
                    .fc-timegrid-now-indicator-line { border-color: #ef4444 !important; }
                    .fc-scrollgrid { border-radius: 0 !important; }
                    .dark .fc-scrollgrid { background: rgb(15 23 42); }
                    .dark .fc-timegrid-slot { background: transparent; }
                    .dark .fc-col-header { background: rgb(15 23 42); }
                    .dark .fc-timegrid-slot-label-cushion { color: #475569; }
                    .fc-daygrid-day-number { font-weight: 600; }
                `}</style>
                <FCComponent
                    ref={calendarRef}
                    plugins={plugins}
                    initialView={view}
                    headerToolbar={false}
                    events={fcEvents}
                    datesSet={handleDatesSet}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    select={handleSelect}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    nowIndicator={true}
                    nowIndicatorContent={(info: any) => {
                        // Use the live 'now' state for the label to ensure it's always accurate
                        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return <div className="fc-now-indicator-content" data-time={time} />;
                    }}
                    scrollTime={scrollTime}
                    slotMinTime="00:00:00"
                    slotMaxTime="24:00:00"
                    slotDuration={slotDuration}
                    slotLabelInterval="01:00"
                    height="100%"
                    allDaySlot={false}
                    dayMaxEvents={true}
                    navLinks={true}
                    navLinkDayClick={(date: Date) => {
                        setView("timeGridDay");
                        calendarRef.current?.getApi().gotoDate(date);
                        calendarRef.current?.getApi().changeView("timeGridDay");
                    }}
                />
            </div>

            {/* Event Popover */}
            {popover && (
                <CalendarEventPopover
                    event={popover.event}
                    position={popover.position}
                    onClose={() => setPopover(null)}
                />
            )}

            {/* Slot Modal */}
            {slotModal && (
                <CalendarSlotModal
                    slotStart={slotModal.start}
                    slotEnd={slotModal.end}
                    onClose={() => setSlotModal(null)}
                />
            )}
        </div>
    );
}

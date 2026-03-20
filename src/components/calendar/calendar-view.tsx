"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { useCalendarEvents, useUpdateCalendarEvent, type CalendarEvent } from "@/hooks/use-calendar";
import { CalendarEventPopover } from "./calendar-event-popover";
import { CalendarSlotModal } from "./calendar-slot-modal";
import { CalendarHeaderStats } from "./calendar-header-stats";
import { useLayoutStore } from "@/store/layout";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CalendarDaySchedule } from "./calendar-day-schedule";

export function CalendarView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calendarRef = React.useRef<any>(null);
    const { 
        calendarViewMode, 
        setCalendarViewMode,
        calendarCommand,
        clearCalendarCommand,
        calendarZoom
    } = useLayoutStore();
    
    const [dateRange, setDateRange] = React.useState<{ start: string; end: string } | undefined>(undefined);
    const [plugins, setPlugins] = React.useState<any[]>([]);
    const [FCComponent, setFCComponent] = React.useState<React.ComponentType<any> | null>(null);
    const [now, setNow] = React.useState(new Date());

    // Handle Calendar Commands from Header (Today, Prev, Next)
    React.useEffect(() => {
        if (!calendarCommand || !calendarRef.current) return;
        
        const api = calendarRef.current.getApi();
        if (calendarCommand === "today") api.today();
        if (calendarCommand === "prev") api.prev();
        if (calendarCommand === "next") api.next();
        
        clearCalendarCommand();
    }, [calendarCommand, clearCalendarCommand]);

    // Sync Calendar View Mode from Store
    React.useEffect(() => {
        if (!calendarRef.current) return;
        const api = calendarRef.current.getApi();
        if (api.view.type !== calendarViewMode) {
            api.changeView(calendarViewMode);
        }
    }, [calendarViewMode]);

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

    // Selected day drill-down state
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

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

    const slotDuration = React.useMemo(() => {
        const durations = ["00:15:00", "00:30:00", "01:00:00", "02:00:00"];
        return durations[calendarZoom - 1];
    }, [calendarZoom]);

    // Sync Slot Duration (Zoom)
    React.useEffect(() => {
        if (!calendarRef.current) return;
        const api = calendarRef.current.getApi();
        api.setOption('slotDuration', slotDuration);
    }, [slotDuration]);

    const scrollTime = React.useMemo(() => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}:00`;
    }, []);


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
        if (calendarViewMode === "dayGridMonth") {
            setSelectedDate(info.date);
        } else if (!info.allDay) {
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
            {/* Stats bar */}

            {/* Stats bar */}
            {!isLoading && <CalendarHeaderStats events={events} />}

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
                    .fc-daygrid-day { cursor: pointer; }
                `}</style>
                <FCComponent
                    ref={calendarRef}
                    plugins={plugins}
                    initialView={calendarViewMode}
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
                    nowIndicatorContent={() => {
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
                        setCalendarViewMode("timeGridDay");
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

            {/* Day Schedule Sheet */}
            <Sheet open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
                <SheetContent className="overflow-y-auto sm:max-w-md lg:max-w-lg">
                    {selectedDate && (
                        <CalendarDaySchedule 
                            date={selectedDate} 
                            events={events} 
                            onClose={() => setSelectedDate(null)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

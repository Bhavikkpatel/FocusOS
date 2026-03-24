"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { useCalendarEvents, useUpdateCalendarEvent, type CalendarEvent } from "@/hooks/use-calendar";
import { CalendarEventPopover } from "./calendar-event-popover";
import { AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarSlotModal } from "./calendar-slot-modal";
import { CalendarHeaderStats } from "./calendar-header-stats";
import { useLayoutStore } from "@/store/layout";
import { useTimerStore } from "@/store/timer";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CalendarDaySchedule } from "./calendar-day-schedule";
import { CalendarHorizontalDay } from "./calendar-horizontal-day";
import { UnallocatedSidebar } from "./unallocated-sidebar";
import { useCreateCalendarEvent } from "@/hooks/use-calendar";

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
    
    // FullCalendar date range for event fetching
    const [dateRange, setDateRange] = React.useState<{ start: string; end: string } | undefined>(undefined);
    
    // Tracking the logical 'current date' for custom views
    const [currentDate, setCurrentDate] = React.useState(new Date());

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
    const { mutate: createEvent } = useCreateCalendarEvent();
    const timer = useTimerStore();

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
    // Convert API events to FullCalendar format
    const fcEvents = React.useMemo(() => {
        return events.map((e) => {
            const estimatedMinutes = (e.task?.estimatedPomodoros || 0) * (e.task?.pomodoroDuration || 25);
            const durationMinutes = (new Date(e.end).getTime() - new Date(e.start).getTime()) / 60000;
            const isUnderBudget = !!(e.task && durationMinutes < estimatedMinutes);

            return {
                id: e.id,
                title: e.title,
                start: e.start,
                end: e.end,
                allDay: e.allDay,
                backgroundColor: e.task?.projectRef?.color || e.color || "#6366f1",
                borderColor: e.task?.projectRef?.color || e.color || "#6366f1",
                textColor: "#ffffff",
                extendedProps: { 
                    calendarEvent: e,
                    isUnderBudget
                },
            };
        });
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
        setCurrentDate(info.view.currentStart);
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

    const handleEventReceive = (info: any) => {
        const { event } = info;
        const taskId = event.extendedProps.taskId;
        const task = event.extendedProps.task;

        if (!taskId || !task) return;

        createEvent({
            title: task.title,
            start: event.startStr,
            end: event.endStr,
            taskId: taskId,
        });

        // Remove the temporary event from the calendar since we'll get a real one from the API
        event.remove();
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
        <div className="flex h-full gap-4 overflow-hidden">
            <div className="flex-1 flex flex-col h-full gap-4 min-w-0">
            {/* Stats bar */}

            {/* Stats bar */}
            {!isLoading && <CalendarHeaderStats events={events} />}

            {/* Calendar */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[600px] relative">
                {calendarViewMode === "timeGridDay" ? (
                    <CalendarHorizontalDay 
                        date={currentDate}
                        events={events}
                        onEventClick={(event, el) => {
                            const rect = el.getBoundingClientRect();
                            setPopover({
                                event,
                                position: { x: rect.right + 8, y: rect.top },
                            });
                        }}
                        onStartFocus={(taskId, eventId) => {
                            const event = events.find(e => e.id === eventId);
                            const task = event?.task;
                            if (!task) return;
                            
                            timer.start(
                                task.pomodoroDuration || 25,
                                "FOCUS",
                                taskId,
                                task.estimatedPomodoros,
                                eventId
                            );
                        }}
                        onSlotSelect={(start) => {
                            setSlotModal({ start });
                        }}
                        onTaskDrop={(taskData, start) => {
                            const end = new Date(start.getTime() + taskData.duration * 60000);

                            createEvent({
                                title: taskData.title,
                                start: start.toISOString(),
                                end: end.toISOString(),
                                taskId: taskData.id,
                            });
                        }}
                        onEventMove={(eventId, start) => {
                            const event = events.find(e => e.id === eventId);
                            if (!event) return;
                            
                            const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
                            const end = new Date(start.getTime() + duration);
                            
                            updateEvent({
                                id: eventId,
                                start: start.toISOString(),
                                end: end.toISOString(),
                            });
                        }}
                        onEventResize={(eventId, durationMinutes) => {
                            const event = events.find(e => e.id === eventId);
                            if (!event) return;
                            
                            const end = new Date(new Date(event.start).getTime() + durationMinutes * 60000);
                            
                            updateEvent({
                                id: eventId,
                                start: event.start,
                                end: end.toISOString(),
                            });
                        }}
                    />
                ) : null}

                <div className={cn(
                    "h-full w-full",
                    calendarViewMode === "timeGridDay" && "hidden"
                )}>
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
                        eventReceive={handleEventReceive}
                        eventContent={(eventInfo: any) => {
                            const { event } = eventInfo;
                            const isUnderBudget = event.extendedProps.isUnderBudget;
                            const color = event.backgroundColor || "#6366f1";
                            const isShort = (event.end && event.start) && (event.end.getTime() - event.start.getTime()) < 45 * 60 * 1000;
                            
                            return (
                                <div className={cn(
                                    "flex flex-col h-full w-full overflow-hidden rounded-md border-l-[4px] transition-all",
                                    isUnderBudget ? "border-amber-500 bg-amber-500/10" : "bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-md"
                                )} style={{ borderLeftColor: isUnderBudget ? undefined : color }}>
                                    <div className={cn(
                                        "flex-1 flex flex-col gap-0.5 px-2 py-1.5",
                                        isShort ? "justify-center" : "justify-start"
                                    )}>
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            {isUnderBudget && <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />}
                                            <span className={cn(
                                                "truncate font-black tracking-tight leading-tight",
                                                isShort ? "text-[10px]" : "text-xs"
                                            )}>
                                                {event.title}
                                            </span>
                                        </div>
                                        {!isShort && (
                                            <div className="flex items-center gap-1 text-[9px] font-bold opacity-60 uppercase tracking-widest">
                                                <Clock className="h-2.5 w-2.5" />
                                                <span>
                                                    {format(event.start, "h:mm a")}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }}
                        editable={true}
                        droppable={true}
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
            </div>
            </div>

            {/* Unallocated Sidebar */}
            <UnallocatedSidebar />

            {/* Event Popover */}
            {popover && (
                <CalendarEventPopover
                    event={popover.event}
                    position={popover.position}
                    onClose={() => setPopover(null)}
                    onStartFocus={(taskId, eventId) => {
                        const task = popover.event.task;
                        if (!task) return;
                        
                        timer.start(
                            task.pomodoroDuration || 25,
                            "FOCUS",
                            taskId,
                            task.estimatedPomodoros,
                            eventId
                        );
                    }}
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

import { addDays, addWeeks, addMonths, getDay } from "date-fns";

export type RecurrenceType = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";

export function calculateNextOccurrence(
    currentDate: Date,
    type: RecurrenceType,
    interval: number = 1,
    days?: string
): Date {
    const baseDate = currentDate || new Date();

    switch (type) {
        case "DAILY":
            return addDays(baseDate, interval);

        case "WEEKLY":
            if (!days) return addWeeks(baseDate, interval);

            // Handle specific weekdays (e.g., "1,3,5" for Mon, Wed, Fri)
            const selectedDays = days.split(",").map(Number).sort((a, b) => a - b);
            const currentDay = getDay(baseDate); // 0 = Sunday, 1 = Monday, ...

            // Find the next day in the list
            const nextInWeek = selectedDays.find(d => d > currentDay);

            if (nextInWeek !== undefined) {
                // It's later this week
                return addDays(baseDate, nextInWeek - currentDay);
            } else {
                // It's next week (or the first selected day next week)
                const firstDayNextWeek = selectedDays[0];
                const daysUntilEndOfWeek = 7 - currentDay;
                return addDays(baseDate, daysUntilEndOfWeek + firstDayNextWeek);
            }

        case "MONTHLY":
            return addMonths(baseDate, interval);

        case "CUSTOM":
            return addDays(baseDate, interval);

        default:
            return addDays(baseDate, 1);
    }
}

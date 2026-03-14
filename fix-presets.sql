-- Fix existing preset durations by converting minutes to seconds
UPDATE "PomodoroPreset" 
SET 
    "focusDuration" = "focusDuration" * 60,
    "shortBreakDuration" = "shortBreakDuration" * 60,
    "longBreakDuration" = "longBreakDuration" * 60
WHERE "focusDuration" < 200;  -- Only update if values look like minutes (< 200 means less than 3 minutes in seconds)

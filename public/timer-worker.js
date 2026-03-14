/**
 * Web Worker for precise timer execution
 * Runs independently of main thread to prevent drift
 */

let timerInterval = null;
let elapsedSeconds = 0;
let totalSeconds = 0;
let isRunning = false;
let startTime = 0;
let lastTickTime = 0;

const DRIFT_TOLERANCE_MS = 50;

self.onmessage = (e) => {
    const { type, payload } = e.data;

    switch (type) {
        case "START":
            start(payload.duration);
            break;
        case "PAUSE":
            pause();
            break;
        case "RESUME":
            resume();
            break;
        case "RESET":
            reset();
            break;
        case "SYNC":
            sync(payload);
            break;
        case "GET_STATE":
            sendState();
            break;
    }
};

function sync({ elapsed, total, isRunning: running }) {
    elapsedSeconds = elapsed;
    totalSeconds = total;
    isRunning = running;

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    if (isRunning) {
        // Recalculate startTime to preserve current elapsed position
        startTime = Date.now() - (elapsedSeconds * 1000);
        lastTickTime = Date.now();
        tick();
    } else {
        // Even if not running, we must send state once to sync UI
        sendState();
    }
}

function start(duration) {
    totalSeconds = duration;
    elapsedSeconds = 0;
    isRunning = true;
    startTime = Date.now();
    lastTickTime = startTime;

    sendState();
    tick();
}

function pause() {
    isRunning = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    sendState();
}

function resume() {
    if (!isRunning && elapsedSeconds < totalSeconds) {
        isRunning = true;
        startTime = Date.now() - (elapsedSeconds * 1000);
        lastTickTime = Date.now();
        tick();
        sendState();
    }
}

function reset() {
    isRunning = false;
    elapsedSeconds = 0;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    sendState();
}

function tick() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        if (!isRunning) {
            return;
        }

        const now = Date.now();
        const actualElapsed = Math.floor((now - startTime) / 1000);

        // Drift correction: use actual time elapsed
        elapsedSeconds = actualElapsed;

        // Check drift tolerance
        const expectedTime = lastTickTime + 1000;
        const drift = Math.abs(now - expectedTime);

        if (drift > DRIFT_TOLERANCE_MS) {
            console.warn(`Timer drift detected: ${drift}ms`);
        }

        lastTickTime = now;

        if (elapsedSeconds >= totalSeconds) {
            isRunning = false;
            elapsedSeconds = totalSeconds;
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            self.postMessage({
                type: "COMPLETE",
                payload: { elapsed: elapsedSeconds, total: totalSeconds },
            });
        }

        sendState();
    }, 1000);
}

function sendState() {
    self.postMessage({
        type: "TICK",
        payload: {
            elapsed: elapsedSeconds,
            total: totalSeconds,
            isRunning,
            remaining: Math.max(0, totalSeconds - elapsedSeconds),
        },
    });
}


"use strict";

// Initialize alarm variables before updateClock()
let alarmTime = null;
let alarmTriggered = false;
// ===============================
// MAIN CLOCK
// ===============================

const timeElement = document.getElementById("time");
const periodElement = document.getElementById("period");
const dateElement = document.getElementById("date");

let is24Hour = localStorage.getItem("clockFormat") === "24";

function updateClock() {
    const now = new Date();

    timeElement.textContent = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: !is24Hour
    });

    periodElement.textContent = is24Hour
        ? "24-HOUR FORMAT"
        : now.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true
        }).slice(-2);

    dateElement.textContent = now.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    updateWorldClock();
    checkAlarm();
}

function updateWorldClock() {
    const zones = {
        india: "Asia/Kolkata",
        newyork: "America/New_York",
        london: "Europe/London",
        tokyo: "Asia/Tokyo"
    };

    for (const [id, zone] of Object.entries(zones)) {
        document.getElementById(id).textContent =
            new Date().toLocaleTimeString("en-US", {
                timeZone: zone,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
    }
}

document.getElementById("formatBtn").textContent =
    is24Hour ? "Switch to 12H" : "Switch to 24H";

document.getElementById("formatBtn").addEventListener("click", () => {
    is24Hour = !is24Hour;

    localStorage.setItem("clockFormat", is24Hour ? "24" : "12");

    document.getElementById("formatBtn").textContent =
        is24Hour ? "Switch to 12H" : "Switch to 24H";

    updateClock();
});

setInterval(updateClock, 1000);
updateClock();

// ===============================
// THEME
// ===============================

const themeBtn = document.getElementById("themeBtn");

function applyTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light");
        themeBtn.textContent = "🌙 Dark Mode";
    } else {
        document.body.classList.remove("light");
        themeBtn.textContent = "☀️ Light Mode";
    }

    localStorage.setItem("theme", theme);
}

// Apply saved theme on page load
const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

// Toggle theme
themeBtn.addEventListener("click", () => {
    const currentTheme = document.body.classList.contains("light")
        ? "light"
        : "dark";

    const newTheme = currentTheme === "light" ? "dark" : "light";

    applyTheme(newTheme);
});

// ===============================
// FULLSCREEN
// ===============================

document.getElementById("fullscreenBtn").addEventListener("click", async () => {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (error) {
        console.error("Fullscreen unavailable:", error);
    }
});


// ===============================
// NAVIGATION TABS
// ===============================

document.querySelectorAll(".tab").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(tab =>
            tab.classList.remove("active")
        );

        document.querySelectorAll(".panel").forEach(panel =>
            panel.classList.remove("active")
        );

        button.classList.add("active");

        document.getElementById(button.dataset.tab)
            .classList.add("active");
    });
});


// ===============================
// STOPWATCH
// ===============================

let stopwatchStart = 0;
let stopwatchElapsed = 0;
let stopwatchInterval = null;

const stopwatchDisplay =
    document.getElementById("stopwatchDisplay");

function formatStopwatch(milliseconds) {
    const totalCentiseconds = Math.floor(milliseconds / 10);

    const centiseconds = totalCentiseconds % 100;
    const totalSeconds = Math.floor(totalCentiseconds / 100);

    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    return (
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0") + "." +
        String(centiseconds).padStart(2, "0")
    );
}

function updateStopwatch() {
    const elapsed =
        stopwatchElapsed + (Date.now() - stopwatchStart);

    stopwatchDisplay.textContent = formatStopwatch(elapsed);
}

document.getElementById("startStopwatch").addEventListener("click", () => {
    if (stopwatchInterval) {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;

        stopwatchElapsed += Date.now() - stopwatchStart;

        document.getElementById("startStopwatch").textContent = "Resume";
    } else {
        stopwatchStart = Date.now();

        stopwatchInterval = setInterval(updateStopwatch, 10);

        document.getElementById("startStopwatch").textContent = "Pause";
    }
});

document.getElementById("resetStopwatch").addEventListener("click", () => {
    clearInterval(stopwatchInterval);

    stopwatchInterval = null;
    stopwatchElapsed = 0;
    stopwatchStart = 0;

    stopwatchDisplay.textContent = "00:00:00.00";

    document.getElementById("startStopwatch").textContent = "Start";
    document.getElementById("laps").innerHTML = "";
});

document.getElementById("lapStopwatch").addEventListener("click", () => {
    if (!stopwatchInterval) return;

    const lap = document.createElement("li");

    lap.textContent =
        "Lap " + (document.getElementById("laps").children.length + 1);

    const lapTime = document.createElement("span");
    lapTime.textContent = stopwatchDisplay.textContent;

    lap.appendChild(lapTime);

    document.getElementById("laps").prepend(lap);
});


// ===============================
// COUNTDOWN TIMER
// ===============================

let timerInterval = null;
let timerRemaining = 0;
let timerEnd = 0;

const timerDisplay = document.getElementById("timerDisplay");

function formatTimer(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return (
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(secs).padStart(2, "0")
    );
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTimer(timerRemaining);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

document.getElementById("startTimer").addEventListener("click", () => {
    if (timerInterval) return;

    if (timerRemaining <= 0) {
        const hours = Number(document.getElementById("timerHours").value) || 0;
        const minutes = Number(document.getElementById("timerMinutes").value) || 0;
        const seconds = Number(document.getElementById("timerSeconds").value) || 0;

        timerRemaining = hours * 3600 + minutes * 60 + seconds;

        if (timerRemaining <= 0) {
            alert("Please enter a valid timer duration.");
            return;
        }
    }

    timerEnd = Date.now() + timerRemaining * 1000;

    timerInterval = setInterval(() => {
        timerRemaining = Math.max(
            0,
            Math.ceil((timerEnd - Date.now()) / 1000)
        );

        updateTimerDisplay();

        if (timerRemaining <= 0) {
            stopTimer();
            playAlarmSound();
            alert("Countdown completed!");
        }
    }, 200);
});

document.getElementById("pauseTimer").addEventListener("click", () => {
    if (!timerInterval) return;

    timerRemaining = Math.max(
        0,
        Math.ceil((timerEnd - Date.now()) / 1000)
    );

    stopTimer();
    updateTimerDisplay();
});

document.getElementById("resetTimer").addEventListener("click", () => {
    stopTimer();
    timerRemaining = 0;
    updateTimerDisplay();
});


// ===============================
// ALARM
// ===============================

// ===============================
// ALARM
// ===============================

const alarmStatus = document.getElementById("alarmStatus");
const alarmSound = document.getElementById("alarmSound");
const stopAlarmBtn = document.getElementById("stopAlarmBtn");

// Set Alarm
document.getElementById("setAlarm").addEventListener("click", () => {
    const value = document.getElementById("alarmTime").value;

    if (!value) {
        alert("Please select an alarm time.");
        return;
    }

    alarmTime = value;
    alarmTriggered = false;

    stopAlarmSound();
    stopAlarmBtn.classList.remove("active");

    alarmStatus.textContent = "Alarm set for " + alarmTime;
});

// Clear Alarm
document.getElementById("clearAlarm").addEventListener("click", () => {
    alarmTime = null;
    alarmTriggered = false;

    stopAlarmSound();
    stopAlarmBtn.classList.remove("active");

    alarmStatus.textContent = "No alarm set";
    document.getElementById("alarmTime").value = "";
});

// Check Alarm
function checkAlarm() {
    if (!alarmTime || alarmTriggered) return;

    const now = new Date();

    const currentTime =
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0");

    if (currentTime === alarmTime) {
        alarmTriggered = true;

        playAlarmSound();

        stopAlarmBtn.classList.add("active");
        alarmStatus.textContent = "⏰ Alarm ringing!";

        // Avoid alert(), which can interrupt the alarm experience
    }
}

// Play alarm sound
function playAlarmSound() {
    if (!alarmSound) return;

    alarmSound.currentTime = 0;
    alarmSound.loop = true;

    alarmSound.play().catch(error => {
        console.error("Unable to play alarm sound:", error);
    });
}

// Stop alarm sound
function stopAlarmSound() {
    if (alarmSound) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        alarmSound.loop = false;
    }
}

// Stop Alarm Button
stopAlarmBtn.addEventListener("click", () => {
    stopAlarmSound();

    stopAlarmBtn.classList.remove("active");

    alarmStatus.textContent = alarmTime
        ? "Alarm stopped"
        : "No alarm set";
});

// ===============================
// ALARM SOUND
// ===============================

function playAlarmSound() {
    const alarmSound = document.getElementById("alarmSound");

    if (!alarmSound) {
        console.error("Alarm audio element not found!");
        return;
    }

    alarmSound.currentTime = 0;
    alarmSound.loop = true;

    alarmSound.play().catch(error => {
        console.error("Unable to play alarm sound:", error);
    });
}



stopAlarmBtn.addEventListener("click", () => {
    stopAlarmSound();

    console.log("Alarm stopped");
});

function stopAlarmSound() {
    const alarmSound = document.getElementById("alarmSound");

    if (alarmSound) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        alarmSound.loop = false;
    }
}
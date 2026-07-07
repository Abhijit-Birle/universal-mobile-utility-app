const durationSeconds = 1500;
let isRunning = true;
const endTime = Date.now() + durationSeconds * 1000;
setTimeout(() => {
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
    console.log("Remaining after ~1s:", remaining);
}, 1000);

import { readTemp } from "@/service/gpio";

const READ_TEMP_ENABLED = process.env.READ_TEMP_ENABLED ?? false;
const READ_TEMP_DELTA_SEC = Number(process.env.READ_TEMP_DELTA_SEC) ?? 60;

export function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs' && READ_TEMP_ENABLED === "true") {
        console.log("Starting temperature reader...");

        setInterval(() => {
            console.log("Running: " + new Date().toLocaleString("it-IT"));
            readTemp()
                .then(console.log)
                .catch(console.error);
        }, READ_TEMP_DELTA_SEC * 1000);
    }
    else console.log("Instrumentation disabled", {
        runtime: process.env.NEXT_RUNTIME,
        READ_TEMP_ENABLED,
        READ_TEMP_DELTA_SEC
    })
}

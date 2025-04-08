const READ_TEMP_ENABLED = process.env.READ_TEMP_ENABLED ?? false;
const READ_TEMP_DELTA_SEC = Number(process.env.READ_TEMP_DELTA_SEC) ?? 300;

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs' && READ_TEMP_ENABLED === "true") {
        let { readTemp } = await import("@/service/gpio");
        let { insertTemperature } = await import("@/service/db");

        console.log("Starting temperature reader...");

        setInterval(async () => {
            try {
                const temperatureString = await readTemp();
                if (temperatureString) {
                    const temperature = (+temperatureString.trim()) / 1000;
                    await insertTemperature(temperature);
                }
            } catch (error) {
                console.error(error);
            }
        }, READ_TEMP_DELTA_SEC * 1000);
    }
    else
        console.log("Instrumentation disabled", {
            runtime: process.env.NEXT_RUNTIME,
            READ_TEMP_ENABLED,
            READ_TEMP_DELTA_SEC
        })
}

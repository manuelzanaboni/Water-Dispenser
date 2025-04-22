const READ_TEMP_ENABLED = process.env.READ_TEMP_ENABLED ?? false;
const READ_TEMP_DELTA_SEC = Number(process.env.READ_TEMP_DELTA_SEC) ?? 120;

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs' && READ_TEMP_ENABLED === "true") {
        let { readTemperature } = await import("@/service/gpio");
        let { insertRefrigerator } = await import("@/service/db");

        console.log("Starting temperature reader...");

        setInterval(async () => {
            try {
                const temperatureString = await readTemperature();
                if (temperatureString) {
                    const temperature = (+temperatureString.trim()) / 1e3;
                    console.log(`Temp = ${temperature} °C`);

                    // ToDo check with setpoint
                    const refrigeratorState = 1;
                    await insertRefrigerator(temperature, refrigeratorState);
                } else
                    console.error(`Error while detecting temperature. temperatureString: ${temperatureString}`);
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

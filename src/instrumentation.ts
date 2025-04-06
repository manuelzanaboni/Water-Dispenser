
export function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {

        setInterval(() => {
            console.log("Running: " + new Date().toLocaleString("it-IT"));
        }, 5000);

    }
}

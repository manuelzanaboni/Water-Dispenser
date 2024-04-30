import { exec } from "child_process";
import { GPIO_MODE, GPIO_STATE } from "@/service/globals";

const subporcess = async (command: string): Promise<string> =>
    new Promise((resolve, reject) =>
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`error: ${error.message}`);
                reject(error);
            } else if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr);
            } else {
                console.log(`stdout:\n${stdout}`);
                resolve(stdout);
            }
        })
    );

const gpio_wrap = async (fun: (command: string) => Promise<string>, command: string) => {
    return fun(command).catch(() => {
        const msg = `Mocking GPIO subprocess: ${command}`;
        console.log(msg);
        return Promise.resolve(msg);
    });
};

const gpio_mode = async (gpio: number, mode: GPIO_MODE) => gpio_wrap(subporcess, `gpio mode ${gpio} ${mode}`);

// export const gpio_read = async (gpio: number) => gpio_wrap(subporcess, `ls`);
export const gpio_read = async (gpio: number) => gpio_wrap(subporcess, `gpio read ${gpio}`);

export const gpio_write = async (gpio: number, state: GPIO_STATE) =>
    gpio_wrap(subporcess, `gpio write ${gpio} ${state}`);

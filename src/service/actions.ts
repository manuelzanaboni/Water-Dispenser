"use server";

import { gpio_read, gpio_write } from "@/service/gpio";
import { GPIO_STATE } from "@/service/globals";

export async function gpio_read_action(gpio: number) {
    return gpio_read(gpio);
}

export async function gpio_write_action(gpio: number, state: GPIO_STATE) {
    return gpio_write(gpio, state);
}

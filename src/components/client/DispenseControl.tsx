"use client";

import { motion } from "motion/react";

import { UnstyledButton } from "@mantine/core";

import WaterAnimation from "@/components/client/WaterAnimation";
import { DispenseOperation } from "@/service/types";
import { SPARKLING_OPERATION } from "@/service/utils";

type DispenseControlProps = {
    operation: DispenseOperation;
    active: boolean;
    disabled: boolean;
    onStart: () => void;
    onStop: () => void;
}

const DispenseControl = (props: DispenseControlProps) => {
    const { operation, active, disabled, onStart, onStop } = props;

    const sparkling = operation.type === SPARKLING_OPERATION.type;

    return (
        <UnstyledButton
            onClick={() => active ? onStop() : onStart()}
            disabled={disabled}
            aria-pressed={active}
            aria-label={`${active ? "Interrompi" : "Avvia"} erogazione ${operation.name}`}
            style={{
                borderRadius: "var(--mantine-radius-md)",
                // the kiosk browser paints a grey box over the whole button on touch
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                userSelect: "none"
            }}
        >
            <motion.div
                whileTap={{ scale: disabled ? 1 : 0.96 }}
                style={{ height: "clamp(320px, 66vh, 580px)", aspectRatio: "348 / 330" }}
            >
                <WaterAnimation color={operation.color} active={active} sparkling={sparkling} />
            </motion.div>
        </UnstyledButton>
    );
}

export default DispenseControl;

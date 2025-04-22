"use client";

import { Button } from "@mantine/core";
import { useFullscreen } from "@mantine/hooks";

import TitledCard from "@/components/client/TitledCard";

const FullScreen = () => {
    const { toggle, fullscreen } = useFullscreen();

    return (
        <TitledCard title="">
            <Button
                onClick={toggle}
                color={fullscreen ? 'red' : 'blue'}
                size="xl"
            >
                Schermo intero
            </Button>
        </TitledCard>
    );
}

export default FullScreen;

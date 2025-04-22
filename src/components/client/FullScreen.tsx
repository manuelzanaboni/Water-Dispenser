"use client";

import { Button, Card } from "@mantine/core";
import { useFullscreen } from "@mantine/hooks";

const FullScreen = () => {
    const { toggle, fullscreen } = useFullscreen();

    return (
        <Card shadow="lg" padding="lg" radius="md" withBorder>
            <Button
                onClick={toggle}
                color={fullscreen ? 'red' : 'blue'}
                size="xl"
            >
                Schermo intero
            </Button>
        </Card>


    );
}

export default FullScreen;

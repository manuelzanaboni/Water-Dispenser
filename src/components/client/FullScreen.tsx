"use client";

import { Button } from "@mantine/core";
import { useFullscreen } from "@mantine/hooks";

const FullScreen = () => {
    const { toggle, fullscreen } = useFullscreen();

    return (
        <Button onClick={toggle} color={fullscreen ? 'red' : 'blue'} size="xl">
            Fullscreen
        </Button>
    );
}

export default FullScreen;

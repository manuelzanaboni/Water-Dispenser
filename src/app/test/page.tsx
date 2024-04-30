"use client";
import { useEffect, useState } from "react";

import Link from "next/link";

import { Button, Group, useMantineColorScheme } from "@mantine/core";

export default function TestApi() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetch("/api/items")
            .then((response) => response.json())
            .then((data) => setItems(data))
            .catch((error) => console.error(error));
    }, []);

    return (
        <>
            <h1>Hello, Settings Page!</h1>
            <Button component={Link} href="/">
                Home
            </Button>
            <br />
            <Group>
                <Button onClick={() => setColorScheme("light")}>Light</Button>
                <Button onClick={() => setColorScheme("dark")}>Dark</Button>
            </Group>
            {JSON.stringify(items, null, 2)}
        </>
    );
}

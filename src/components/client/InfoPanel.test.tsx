import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import InfoPanel from "@/components/client/InfoPanel";

describe("InfoPanel", () => {
    test("lists the app version and the hardware it runs on", () => {
        render(<InfoPanel version="2.0.0" />);

        const rows = screen.getAllByRole("term").map(term => [term.textContent, term.nextElementSibling?.textContent]);
        expect(rows).toEqual([
            ["Versione", "2.0.0"],
            ["Erogatore", "BWT AQA drink U20 CAS"],
            ["Scheda", "Orange Pi Zero 3"],
        ]);
    });
});

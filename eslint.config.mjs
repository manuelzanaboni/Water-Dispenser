import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
    ...nextVitals,
    {
        // React Compiler rules from eslint-plugin-react-hooks 7, not enabled under next lint;
        // the app does not use the compiler, and the flagged spots are deliberate
        // (state set after mount to avoid hydration mismatches, Date.now() in per-request pages)
        rules: {
            "react-hooks/purity": "off",
            "react-hooks/set-state-in-effect": "off",
        },
    },
    globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
]);

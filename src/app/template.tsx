"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        // <AnimatePresence>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // initial={{ x: "-50vw", opacity: 0 }}
            // animate={{ x: 0, opacity: 1 }}

            transition={{ ease: "easeInOut", duration: 1 }}
        >
            {children}
        </motion.div>
        // </AnimatePresence>
    );
}

"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Track first load globally within the session
let isFirstLoadGlobal = true;

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isFirstLoad, setIsFirstLoad] = useState(isFirstLoadGlobal);
    const isPost = pathname.startsWith("/posts");

    useEffect(() => {
        if (isFirstLoadGlobal) {
            isFirstLoadGlobal = false;
        }
    }, []);

    return (
        <motion.div
            key={pathname}
            initial={{
                opacity: 0,
                x: isFirstLoad ? 0 : (isPost ? 20 : -20),
                y: isFirstLoad ? 20 : 0
            }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ ease: "easeOut", duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

let isFirstLoadGlobal = true;

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isFirstLoad] = useState(isFirstLoadGlobal);
    const isPost = pathname.startsWith("/posts");

    useEffect(() => {
        if (isFirstLoadGlobal) isFirstLoadGlobal = false;
    }, []);

    const animation = isFirstLoad
        ? "animate-fade-up"
        : isPost
            ? "animate-slide-left"
            : "animate-slide-right";

    return (
        <div className={animation}>
            {children}
        </div>
    );
}

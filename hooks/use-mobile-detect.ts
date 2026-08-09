"use client";

import { useState, useEffect } from "react";

export function useMobileDetect(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const updateTarget = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    updateTarget(mediaQuery);
    mediaQuery.addEventListener("change", updateTarget);
    return () => mediaQuery.removeEventListener("change", updateTarget);
  }, [breakpoint]);

  return isMobile;
}

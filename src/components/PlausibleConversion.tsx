"use client";

import { useEffect, useRef } from "react";
import { trackPlausibleEvent, type PlausibleEvent } from "@/lib/plausible";

type PlausibleConversionProps = {
  event: PlausibleEvent;
  once?: boolean;
};

/** Traccia un evento Plausible una volta al mount (es. dopo redirect con query). */
export function PlausibleConversion({ event, once = true }: PlausibleConversionProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (once && fired.current) return;
    fired.current = true;
    trackPlausibleEvent(event);
  }, [event, once]);

  return null;
}

"use client";

import { useEffect } from "react";
import { initPlausible, isPlausibleEnabled } from "@/lib/plausible";

/** Inizializza @plausible-analytics/tracker (pageview automatici). */
export function PlausibleProvider() {
  useEffect(() => {
    if (isPlausibleEnabled()) initPlausible();
  }, []);

  return null;
}

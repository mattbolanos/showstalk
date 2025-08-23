"use client";
// react-scan must be imported before react
import { scan } from "react-scan";
import { useEffect } from "react";

export function ReactScan() {
  useEffect(() => {
    scan({
      enabled: true,
      dangerouslyForceRunInProduction: process.env.NODE_ENV === "development",
    });
  }, []);

  return <></>;
}

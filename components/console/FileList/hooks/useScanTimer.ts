import { useState, useEffect, useRef } from "react";

const getStoredElapsedTime = () => {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("nia-elapsed-time") || "0", 10);
};

const getStoredStartTime = () => {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("nia-scan-start-time") || "0", 10);
};

export const useScanTimer = (
  scanning: string[],
  currentlyScanning: string | null,
) => {
  const [elapsedTime, setElapsedTime] = useState(getStoredElapsedTime);
  const scanStartTimeRef = useRef<number>(getStoredStartTime());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const isScanning = scanning.length > 0 || currentlyScanning;

    if (isScanning) {
      if (scanStartTimeRef.current === 0) {
        scanStartTimeRef.current = Date.now();
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "nia-scan-start-time",
            scanStartTimeRef.current.toString(),
          );
        }
      }

      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - scanStartTimeRef.current) / 1000,
        );
        setElapsedTime(elapsed);
        if (typeof window !== "undefined") {
          localStorage.setItem("nia-elapsed-time", elapsed.toString());
        }
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else if (scanStartTimeRef.current > 0) {
      scanStartTimeRef.current = 0;
      if (typeof window !== "undefined") {
        localStorage.removeItem("nia-elapsed-time");
        localStorage.removeItem("nia-scan-start-time");
      }
    }
  }, [scanning.length, currentlyScanning]);

  return { elapsedTime };
};

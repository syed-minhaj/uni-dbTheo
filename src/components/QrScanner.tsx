"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type QrScannerProps = {
  onScan: (decodedText: string) => void;
  paused?: boolean;
};

export function QrScanner({ onScan, paused = false }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const runningRef = useRef(false);
  const lastScanRef = useRef("");
  const [error, setError] = useState<string | null>(null);
  const containerId = "qr-camera-feed";

  const handleScan = useCallback(
    (decodedText: string) => {
      if (paused) {
        return;
      }

      if (lastScanRef.current === decodedText) {
        return;
      }

      lastScanRef.current = decodedText;
      onScan(decodedText);
    },
    [onScan, paused],
  );

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      if (runningRef.current || !mounted) {
        return;
      }

      try {
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleScan,
          () => undefined,
        );

        runningRef.current = true;
        setError(null);
      } catch (startError) {
        console.error(startError);
        if (mounted) {
          setError(
            "Unable to access camera. Allow camera permissions and use HTTPS or localhost.",
          );
        }
      }
    }

    startScanner();

    return () => {
      mounted = false;

      if (scannerRef.current && runningRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(console.error);
        runningRef.current = false;
        scannerRef.current = null;
      }
    };
  }, [handleScan]);

  return (
    <div className="space-y-3">
      <div
        className={`overflow-hidden rounded border border-navy-200 bg-navy-950/5 ${
          paused ? "hidden" : "block"
        }`}
      >
        <div id={containerId} className="w-full w-full" />
      </div>

      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : (
        <p className="text-sm text-muted">
          Point your camera at a book QR sticker. Each successful scan creates a
          unique transaction ID.
        </p>
      )}
    </div>
  );
}

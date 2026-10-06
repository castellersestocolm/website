import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";
import styles from "./styles.module.css";

export default function ScannerQR({ onDetected }: any) {
  const mountId = "html5qr-reader";
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const fps = 10;
  const qrbox = 250;

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      mountId,
      { fps, qrbox: { width: qrbox, height: qrbox } },
      false,
    );

    scanner.render(
      (decodedText: string) => {
        onDetected(decodedText);
      },
      (err: any) => {
        console.warn("QR scan error", err);
      },
    );

    scannerRef.current = scanner;

    // Cleanup when closed
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
          });
      }
    };
  }, [fps, qrbox, onDetected]);

  return <div id={mountId} className={styles.scannerBox} />;
}

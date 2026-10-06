import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";
import styles from "./styles.module.css";

export default function ScannerQR({ onDetected }: any) {
  const mountId = "html5qr-reader";
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [0],
      videoConstraints: {
        facingMode: "environment",
      },
    };

    const scanner = new Html5QrcodeScanner(mountId, config, false);

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
  }, [onDetected]);

  return <div id={mountId} className={styles.scannerBox} />;
}

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";
import { Box, Button, Typography } from "@mui/material";

export default function ScannerQR({ onClose, onDetected }: any) {
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

  return (
    <>
      <div id={mountId} style={{ width: "100%", minHeight: 320 }} />
      <Box>
        <Typography>
          Tip: Allow camera permission and prefer a well-lit area for better
          results.
        </Typography>
        <Button
          onClick={() => {
            if (scannerRef.current) {
              scannerRef.current
                .clear()
                .catch(() => {})
                .finally(() => onClose());
            } else {
              onClose();
            }
          }}
        >
          Close
        </Button>
      </Box>
    </>
  );
}

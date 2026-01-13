"use client";

import { useState, useRef, useCallback } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onScanError?: (error: string) => void;
  height?: number;
  scanCooldown?: number; // Cooldown in ms between scans
}

export function QRScanner({
  onScanSuccess,
  onScanError,
  height = 210,
  scanCooldown = 2000, // Default 2 seconds
}: QRScannerProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastScanTime = useRef<number>(0);

  const handleScan = useCallback((result: { rawValue: string }[]) => {
    if (result && result.length > 0) {
      const now = Date.now();
      // Check if enough time has passed since last scan
      if (now - lastScanTime.current >= scanCooldown) {
        lastScanTime.current = now;
        onScanSuccess(result[0].rawValue);
      }
    }
  }, [onScanSuccess, scanCooldown]);

  const handleError = (err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : String(err);

    if (errorMessage.includes("Permission") || errorMessage.includes("NotAllowedError")) {
      setError("Vui lòng cấp quyền truy cập camera");
    } else if (errorMessage.includes("NotFoundError")) {
      setError("Không tìm thấy camera");
    } else if (errorMessage.includes("NotReadableError")) {
      setError("Camera đang được sử dụng");
    } else {
      setError("Không thể khởi động camera");
    }

    onScanError?.(errorMessage);
    setIsEnabled(false);
  };

  const toggleCamera = () => {
    setError(null);
    setIsEnabled(!isEnabled);
  };

  return (
    <div className="relative" style={{ height }}>
      {isEnabled ? (
        <>
          <Scanner
            onScan={handleScan}
            onError={handleError}
            formats={[
              'qr_code',      // Mã QR
              'code_128',     // Mã vạch vận đơn, kho bãi (Phổ biến nhất)
              'code_39',      // Mã vạch công nghiệp cũ
              'ean_13',       // Mã vạch sản phẩm tiêu dùng (Siêu thị)
              'ean_8',        // Mã vạch ngắn
              'upc_a',        // Mã vạch Mỹ
            ]}
            constraints={{ facingMode: "environment" }}
            styles={{
              container: {
                width: "100%",
                height: "100%",
                borderRadius: "0.5rem",
                overflow: "hidden",
              },
              video: {
                width: "100%",
                height: "100%",
                objectFit: "cover",
              },
            }}
            components={{
              finder: false,
            }}
          />

          {/* Custom scanning overlay */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-lg relative w-[80%] h-[80%]">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-destructive rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-destructive rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-destructive rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-destructive rounded-br-lg"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-destructive/70 shadow-lg shadow-destructive/50 animate-vertical-slide"></div>
              </div>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-2 py-1 rounded text-[10px] text-white">
              Đưa mã QR vào khung hình
            </div>
          </div>

          {/* Stop button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-black/70 text-white"
            onClick={toggleCamera}
          >
            <CameraOff className="size-3" />
          </Button>
        </>
      ) : (
        <div
          className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex flex-col items-center justify-center"
        >
          {error ? (
            <>
              <CameraOff className="size-8 text-destructive mb-2" />
              <p className="text-xs text-destructive text-center px-4">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={toggleCamera}>
                <Camera className="size-3 mr-1" />
                Thử lại
              </Button>
            </>
          ) : (
            <>
              <Camera className="size-8 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Camera đang tắt</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={toggleCamera}>
                <Camera className="size-3 mr-1" />
                Bật Camera
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

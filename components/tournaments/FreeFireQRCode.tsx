"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Loader2, AlertCircle } from "lucide-react";

interface Props {
  value: string;
  size?: number;
  className?: string;
  onDataUrlGenerated?: (dataUrl: string) => void;
}

export default function FreeFireQRCode({
  value,
  size = 220,
  className = "",
  onDataUrlGenerated,
}: Props) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!value) {
      setError("No URL provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    QRCode.toDataURL(value, {
      width: size * 2, // High resolution for crisp rendering
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setLoading(false);
          if (onDataUrlGenerated) {
            onDataUrlGenerated(url);
          }
        }
      })
      .catch((err) => {
        console.error("Local QR Code Generation Error:", err);
        if (isMounted) {
          setError("Failed to generate QR code");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, onDataUrlGenerated]);

  if (loading) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-white rounded ${className}`}
      >
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex flex-col items-center justify-center bg-red-50 text-red-600 p-2 text-center rounded ${className}`}
      >
        <AlertCircle className="w-6 h-6 mb-1" />
        <span className="text-[11px] font-mono">QR Error</span>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative bg-white flex items-center justify-center p-1 rounded ${className}`}
    >
      <img
        src={dataUrl}
        alt="WhatsApp Official Lobby QR Code"
        className="w-full h-full object-contain select-none"
      />
    </div>
  );
}

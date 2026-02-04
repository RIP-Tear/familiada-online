"use client";
import { useEffect } from "react";

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

export default function AdSense({ 
  adSlot, 
  adFormat = "auto", 
  fullWidthResponsive = true,
  style = { display: "block", textAlign: "center", margin: "20px 0" }
}: AdSenseProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      if (window.adsbygoogle && process.env.NODE_ENV === "production") {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  // Nie pokazuj reklam w developmencie
  if (process.env.NODE_ENV !== "production") {
    return (
      <div style={{ 
        ...style, 
        background: "#f0f0f0", 
        border: "2px dashed #ccc",
        padding: "20px",
        color: "#666"
      }}>
        [AdSense Placeholder - Development Mode]
      </div>
    );
  }

  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-XXXXXXXXXXXXXXXXX";

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client={adsenseClientId}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  );
}

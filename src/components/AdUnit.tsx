"use client";

import { useEffect } from "react";

const AD_CLIENT = "ca-pub-2764762981727603";
const AD_SLOT = "4277564345";

export function AdUnit() {
  useEffect(() => {
    try {
      (
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []
      ).push({});
    } catch {}
  }, []);

  return (
    <div style={{ display: "flex", width: "100%", justifyContent: "center", overflow: "hidden", margin: "16px 0" }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight: "90px" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

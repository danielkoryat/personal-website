import { ImageResponse } from "next/og";
import { getSiteConfig } from "@/lib/utils";

export const alt = "Daniel Koryat — Backend Developer & AWS Cloud Specialist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated link-preview card at the correct 1200×630 aspect ratio. The
 * previous setup declared those dimensions but pointed at a 1024×1024 image,
 * so previews were cropped.
 */
export default async function OpengraphImage() {
  const config = getSiteConfig();

  // Take a couple from each core category so the card reads as a spread
  // rather than six backend libraries in a row.
  const highlights = (["backend", "cloud", "ai-ml"] as const).flatMap(
    (category) =>
      config.skills
        .filter((skill) => skill.category === category)
        .slice(0, 2)
        .map((skill) => skill.name)
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 68,
              height: 68,
              borderRadius: 20,
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            DK
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#93c5fd",
              letterSpacing: 2,
            }}
          >
            {config.contact.location.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            {config.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 36,
              color: "#c7d2fe",
              lineHeight: 1.3,
            }}
          >
            {config.title}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {highlights.map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                border: "1px solid rgba(147,197,253,0.35)",
                background: "rgba(59,130,246,0.14)",
                fontSize: 24,
                color: "#dbeafe",
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}

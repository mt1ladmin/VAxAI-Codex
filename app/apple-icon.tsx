import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon — pine + site wordmark (matches public dark logo). */
export default async function AppleIcon() {
  let dataUrl: string | null = null;
  try {
    const buf = await readFile(join(process.cwd(), "public/vaxai-logo.png"));
    dataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    dataUrl = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#122428",
          borderRadius: 36,
        }}
      >
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            width={150}
            height={52}
            style={{ objectFit: "contain" }}
            alt=""
          />
        ) : (
          <span
            style={{
              color: "#F5F8F8",
              fontSize: 64,
              fontWeight: 700,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            VA
          </span>
        )}
      </div>
    ),
    { ...size },
  );
}

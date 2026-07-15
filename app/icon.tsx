import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Browser tab / Google favicon — same wordmark as the public site on pine,
 * so it matches the home header treatment (not the portrait vaxai.jpg).
 */
export default async function Icon() {
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
          borderRadius: 6,
        }}
      >
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            width={28}
            height={10}
            style={{ objectFit: "contain" }}
            alt=""
          />
        ) : (
          <span
            style={{
              color: "#F5F8F8",
              fontSize: 12,
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

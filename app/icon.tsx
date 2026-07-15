import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Browser tab icon — uses the current brand mark from public/vaxai.jpg */
export default async function Icon() {
  let dataUrl: string | null = null;
  try {
    const buf = await readFile(join(process.cwd(), "public/vaxai.jpg"));
    dataUrl = `data:image/jpeg;base64,${buf.toString("base64")}`;
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
            width={26}
            height={26}
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

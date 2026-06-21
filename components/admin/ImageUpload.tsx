"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Pencil, Trash2 } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectClass?: string; // e.g. "aspect-video" or "aspect-square"
  circular?: boolean;
};

export default function ImageUpload({ value, onChange, label, aspectClass = "aspect-video", circular = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const json = await res.json() as { url?: string; error?: string };
    setUploading(false);
    if (json.url) {
      onChange(json.url);
    } else {
      setError(json.error ?? "Upload failed. Make sure the vaxai-studio storage bucket exists in Supabase.");
    }
  };

  const roundedClass = circular ? "rounded-full" : "rounded-md";

  return (
    <div>
      {label && (
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">{label}</p>
      )}

      {value ? (
        <div className={`relative overflow-hidden border border-gray-200 ${roundedClass} ${circular ? "h-20 w-20" : "w-full"}`}>
          <img
            src={value}
            alt=""
            className={`h-full w-full object-cover ${aspectClass}`}
          />
          <div className={`absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity hover:opacity-100 ${roundedClass}`}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="grid h-7 w-7 place-items-center rounded-full bg-white text-gray-800 hover:bg-gray-100"
              title="Change image"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="grid h-7 w-7 place-items-center rounded-full bg-white text-red-600 hover:bg-red-50"
              title="Remove image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`flex w-full items-center justify-center gap-2 border border-dashed border-gray-300 bg-gray-50 text-sm font-semibold text-gray-500 transition-colors hover:border-[#063b32]/40 hover:bg-gray-100 hover:text-[#063b32] disabled:opacity-60 ${roundedClass} ${
            circular ? "h-20 w-20 flex-col text-[10px]" : `${aspectClass} p-6`
          }`}
        >
          {uploading ? (
            <><Loader2 className="h-5 w-5 animate-spin" />{!circular && "Uploading…"}</>
          ) : (
            <><ImageIcon className={circular ? "h-6 w-6" : "h-5 w-5"} />{!circular && (label ?? "Upload image")}</>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }}
      />

      {error && (
        <p className="mt-1.5 text-[11px] text-red-600">{error}</p>
      )}
    </div>
  );
}

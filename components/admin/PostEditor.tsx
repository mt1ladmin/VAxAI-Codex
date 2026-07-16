"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import {
  Bold,
  ExternalLink,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Undo,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ImageUpload from "./ImageUpload";

const FREE_IMAGE_SOURCES = [
  {
    name: "Pexels",
    href: "https://www.pexels.com",
    blurb: "Free stock photos and videos for commercial use.",
  },
  {
    name: "Unsplash",
    href: "https://unsplash.com",
    blurb: "High-quality free photos from a global community.",
  },
  {
    name: "Pixabay",
    href: "https://pixabay.com",
    blurb: "Free images, illustrations and vectors.",
  },
] as const;

type Props = {
  title: string;
  onTitleChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  coverImageUrl: string;
  onCoverImageUrlChange: (v: string) => void;
  initialHtml?: string;
  onHtmlChange: (html: string) => void;
};

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").filter(Boolean).length : 0;
}

function ToolbarBtn({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`grid h-8 w-8 place-items-center rounded-lg text-sm transition-colors ${
        active ? "bg-pine-900 text-white" : "text-muted hover:bg-pine-50 hover:text-pine-900"
      }`}
    >
      {children}
    </button>
  );
}

export default function PostEditor({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  coverImageUrl,
  onCoverImageUrlChange,
  initialHtml = "",
  onHtmlChange,
}: Props) {
  const [findImagesOpen, setFindImagesOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({ inline: false, allowBase64: true }),
      TiptapLink.configure({ openOnClick: false }),
    ],
    content: initialHtml,
    onUpdate({ editor }) {
      onHtmlChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "outline-none min-h-[300px] text-gray-800 leading-[1.8] text-[1.0625rem]",
      },
    },
  });

  useEffect(() => {
    if (editor && initialHtml && editor.isEmpty) {
      editor.commands.setContent(initialHtml);
    }
  }, [editor, initialHtml]);

  const wordCount = useMemo(() => countWords(editor?.getHTML() ?? ""), [editor?.getHTML()]);

  const addImage = () => {
    const url = window.prompt("Image URL:");
    if (url && editor) editor.chain().focus().setImage({ src: url }).run();
  };

  const coverBtnClass =
    "rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow hover:bg-pine-50";

  const addLink = () => {
    const url = window.prompt("URL:");
    if (url && editor) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-pine-900/10 bg-white shadow-sm">
      {/* Formatting toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-pine-900/8 bg-white px-4 py-2.5 md:px-5">
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-pine-900/10" />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} title="Heading 2">
          <span className="text-[11px] font-bold">H2</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()} active={editor?.isActive("heading", { level: 4 })} title="Heading 4">
          <span className="text-[11px] font-bold">H4</span>
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-pine-900/10" />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} title="Blockquote">
          <Quote className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="Bullet list">
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="Ordered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-pine-900/10" />
        <ToolbarBtn onClick={addLink} active={editor?.isActive("link")} title="Insert link">
          <Link2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={addImage} title="Insert image URL">
          <ImageIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <Minus className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-pine-900/10" />
        <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo">
          <Undo className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo">
          <Redo className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <span className="ml-auto text-xs font-medium text-muted">{wordCount} {wordCount === 1 ? "word" : "words"}</span>
      </div>

      {/* Cover image */}
      {coverImageUrl ? (
        <div className="relative">
          <img src={coverImageUrl} alt="Cover" className="max-h-80 w-full object-cover" />
          <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
            <label className={`cursor-pointer ${coverBtnClass}`}>
              Change
              <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData(); fd.append("file", file);
                const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                const json = await res.json() as { url?: string };
                if (json.url) onCoverImageUrlChange(json.url);
                e.target.value = "";
              }} />
            </label>
            <button type="button" onClick={() => onCoverImageUrlChange("")} className={coverBtnClass}>
              Remove
            </button>
            <button type="button" onClick={() => setFindImagesOpen(true)} className={coverBtnClass}>
              Find free images
            </button>
            <button type="button" onClick={() => setFindImagesOpen(true)} className={coverBtnClass}>
              Browse stock photos
            </button>
          </div>
        </div>
      ) : (
        <div className="border-b border-dashed border-pine-900/15 bg-white py-12">
          <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 text-sm text-muted transition-colors hover:text-pine-900">
            <ImageIcon className="h-8 w-8 opacity-50" />
            <span className="font-semibold">Add cover image</span>
            <span className="text-xs">PNG, JPG, WEBP — shown on the post and social previews</span>
            <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData(); fd.append("file", file);
              const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
              const json = await res.json() as { url?: string };
              if (json.url) onCoverImageUrlChange(json.url);
              e.target.value = "";
            }} />
          </label>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setFindImagesOpen(true)}
              className="rounded-md border border-pine-900/12 bg-white px-3 py-1.5 text-xs font-semibold text-pine-900 shadow-sm hover:bg-pine-50"
            >
              Find free images
            </button>
            <button
              type="button"
              onClick={() => setFindImagesOpen(true)}
              className="rounded-md border border-pine-900/12 bg-white px-3 py-1.5 text-xs font-semibold text-pine-900 shadow-sm hover:bg-pine-50"
            >
              Browse stock photos
            </button>
          </div>
        </div>
      )}

      {findImagesOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/45 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="find-free-images-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setFindImagesOpen(false);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-pine-900/10 bg-white shadow-lift">
            <div className="flex items-start justify-between gap-3 border-b border-pine-900/8 px-5 py-4">
              <div>
                <p id="find-free-images-title" className="text-sm font-semibold text-pine-900">
                  Find free images
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Open a free stock library, download an image, then use Change or Add cover image to
                  upload it here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFindImagesOpen(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-pine-50 hover:text-pine-900"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="divide-y divide-pine-900/8 p-2">
              {FREE_IMAGE_SOURCES.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-pine-50"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pine-900 text-paper">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-pine-900">{source.name}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted">{source.blurb}</span>
                      <span className="mt-1 block truncate text-[11px] text-pine-700">{source.href}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {/* Content area */}
      <div className="mx-auto w-full max-w-2xl px-6 py-10 pb-40 md:px-10">
        {/* Title */}
        <textarea
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Post title"
          rows={1}
          className="w-full resize-none border-none bg-transparent text-3xl font-semibold leading-tight tracking-tight text-pine-900 outline-none placeholder:text-muted/40 md:text-4xl"
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }}
        />

        {/* Standfirst */}
        <div className="mt-5">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Standfirst</p>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Short summary under the title — also used as the meta description"
            rows={2}
            className="w-full resize-none border-none bg-transparent text-base leading-7 text-muted outline-none placeholder:text-muted/40 md:text-lg"
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
          />
        </div>

        {/* Body */}
        <div className="mt-6 border-t border-pine-900/8 pt-6">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Body</p>
          <EditorContent editor={editor} />
        </div>
      </div>

      <style jsx global>{`
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin: 2rem 0 0.75rem; color: #111; }
        .ProseMirror h4 { font-size: 0.875rem; font-weight: 700; margin: 1.5rem 0 0.5rem; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; }
        .ProseMirror blockquote { border-left: 3px solid #122428; padding-left: 1.25rem; color: #6b7280; font-style: italic; margin: 1.5rem 0; }
        .ProseMirror img { max-width: 100%; border-radius: 0.5rem; margin: 1.5rem 0; }
        .ProseMirror hr { border: none; border-top: 1px solid #e5e7eb; margin: 2.5rem 0; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin: 1rem 0; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin: 1rem 0; }
        .ProseMirror li { margin: 0.35rem 0; }
        .ProseMirror a { color: #122428; text-decoration: underline; }
        .ProseMirror p { margin: 0.85rem 0; }
        .ProseMirror p:first-child { margin-top: 0; }
      `}</style>
    </div>
  );
}

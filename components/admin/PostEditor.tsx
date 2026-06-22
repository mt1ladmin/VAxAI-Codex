"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import {
  Bold,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Undo,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import ImageUpload from "./ImageUpload";

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
      className={`grid h-7 w-7 place-items-center rounded text-sm transition-colors ${
        active ? "bg-[#063b32] text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
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

  const addLink = () => {
    const url = window.prompt("URL:");
    if (url && editor) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-col bg-white min-h-full">
      {/* Formatting toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-white px-6 py-2">
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} title="Heading 2">
          <span className="text-[11px] font-bold">H2</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()} active={editor?.isActive("heading", { level: 4 })} title="Heading 4">
          <span className="text-[11px] font-bold">H4</span>
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} title="Blockquote">
          <Quote className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="Bullet list">
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="Ordered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarBtn onClick={addLink} active={editor?.isActive("link")} title="Insert link">
          <Link2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={addImage} title="Insert image URL">
          <ImageIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <Minus className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo">
          <Undo className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo">
          <Redo className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <span className="ml-auto text-xs text-gray-400">{wordCount} {wordCount === 1 ? "word" : "words"}</span>
      </div>

      {/* Cover image */}
      {coverImageUrl ? (
        <div className="relative">
          <img src={coverImageUrl} alt="Cover" className="max-h-80 w-full object-cover" />
          <div className="absolute right-4 top-4 flex gap-2">
            <label className="cursor-pointer rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow hover:bg-white">
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
            <button onClick={() => onCoverImageUrlChange("")} className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow hover:bg-white">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 border-b border-dashed border-gray-200 bg-gray-50 py-12 text-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
          <ImageIcon className="h-8 w-8 opacity-40" />
          <span className="font-semibold">Click to upload a cover image</span>
          <span className="text-xs">PNG, JPG, WEBP up to 10MB</span>
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
      )}

      {/* Content area */}
      <div className="mx-auto w-full max-w-2xl px-8 py-10">
        {/* Title */}
        <textarea
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Post title"
          rows={1}
          className="w-full resize-none border-none bg-transparent text-4xl font-bold leading-tight text-gray-900 outline-none placeholder:text-gray-300"
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }}
        />

        {/* Standfirst */}
        <div className="mt-5">
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Standfirst — a brief summary shown under the title and used as the meta description…"
            rows={2}
            className="w-full resize-none border-none bg-transparent text-lg leading-7 text-gray-500 outline-none placeholder:text-gray-300"
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
          />
        </div>

        {/* Body */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Body</p>
          <EditorContent editor={editor} />
        </div>
      </div>

      <style jsx global>{`
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin: 2rem 0 0.75rem; color: #111; }
        .ProseMirror h4 { font-size: 0.875rem; font-weight: 700; margin: 1.5rem 0 0.5rem; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; }
        .ProseMirror blockquote { border-left: 3px solid #063b32; padding-left: 1.25rem; color: #6b7280; font-style: italic; margin: 1.5rem 0; }
        .ProseMirror img { max-width: 100%; border-radius: 0.5rem; margin: 1.5rem 0; }
        .ProseMirror hr { border: none; border-top: 1px solid #e5e7eb; margin: 2.5rem 0; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin: 1rem 0; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin: 1rem 0; }
        .ProseMirror li { margin: 0.35rem 0; }
        .ProseMirror a { color: #063b32; text-decoration: underline; }
        .ProseMirror p { margin: 0.85rem 0; }
        .ProseMirror p:first-child { margin-top: 0; }
      `}</style>
    </div>
  );
}

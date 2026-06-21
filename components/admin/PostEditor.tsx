"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Bold, Image as ImageIcon, Italic, Link2, List, ListOrdered, Minus, Quote, Redo, Undo } from "lucide-react";
import { useEffect } from "react";

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
        active ? "bg-[#063b32] text-white" : "text-[#6f6b62] hover:bg-[#f7f4ea] hover:text-[#111111]"
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
      TiptapImage.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
    ],
    content: initialHtml,
    onUpdate({ editor }) {
      onHtmlChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none outline-none min-h-[200px] text-[#111111] leading-7",
      },
    },
  });

  useEffect(() => {
    if (editor && initialHtml && editor.isEmpty) {
      editor.commands.setContent(initialHtml);
    }
  }, [editor, initialHtml]);

  const addImage = () => {
    const url = window.prompt("Image URL:");
    if (url && editor) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = window.prompt("URL:");
    if (url && editor) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-col">
      {/* Formatting toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-0.5 border-b border-[#111111]/10 bg-white px-4 py-2">
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-[#111111]/12" />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} title="Heading 2">
          <span className="text-[11px] font-bold">H2</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()} active={editor?.isActive("heading", { level: 4 })} title="Heading 4">
          <span className="text-[11px] font-bold">H4</span>
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-[#111111]/12" />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} title="Blockquote">
          <Quote className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="Bullet list">
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="Ordered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-[#111111]/12" />
        <ToolbarBtn onClick={addLink} active={editor?.isActive("link")} title="Insert link">
          <Link2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={addImage} title="Insert image">
          <ImageIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <Minus className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-[#111111]/12" />
        <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo">
          <Undo className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo">
          <Redo className="h-3.5 w-3.5" />
        </ToolbarBtn>
      </div>

      {/* Cover image */}
      <div className="group relative">
        {coverImageUrl ? (
          <div className="relative">
            <img src={coverImageUrl} alt="Cover" className="max-h-72 w-full object-cover" />
            <button
              type="button"
              onClick={() => onCoverImageUrlChange("")}
              className="absolute right-3 top-3 rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#111111] shadow hover:bg-white"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center border-b border-dashed border-[#111111]/15 bg-[#f7f4ea] py-10">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Cover image</p>
              <input
                type="url"
                placeholder="Paste image URL…"
                onBlur={(e) => { if (e.target.value) onCoverImageUrlChange(e.target.value); }}
                className="mt-2 rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-3xl px-8 py-10">
        <textarea
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Post title"
          rows={1}
          className="w-full resize-none border-none bg-transparent text-4xl font-bold leading-tight text-[#111111] outline-none placeholder:text-[#6f6b62]/40"
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }}
        />
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Add a standfirst — a brief summary shown under the title and used as the meta description…"
          rows={2}
          className="mt-4 w-full resize-none border-none bg-transparent text-lg leading-7 text-[#6f6b62] outline-none placeholder:text-[#6f6b62]/40"
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }}
        />
        <div className="mt-6 border-t border-[#111111]/10 pt-6">
          <EditorContent editor={editor} />
        </div>
      </div>

      <style jsx global>{`
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.75rem; }
        .ProseMirror h4 { font-size: 1rem; font-weight: 700; margin: 1.25rem 0 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6f6b62; }
        .ProseMirror blockquote { border-left: 3px solid #063b32; padding-left: 1rem; color: #6f6b62; font-style: italic; }
        .ProseMirror img { max-width: 100%; border-radius: 0.375rem; }
        .ProseMirror hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5rem; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; }
        .ProseMirror a { color: #063b32; text-decoration: underline; }
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #9ca3af; pointer-events: none; height: 0; }
      `}</style>
    </div>
  );
}

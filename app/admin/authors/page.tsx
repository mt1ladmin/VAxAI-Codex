"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit2, Plus, Trash2, X } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

type Author = { id: string; name: string; bio: string; avatar_url: string | null; linkedin_url: string | null; created_at: string };

function AuthorForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Author>;
  onSave: (data: { name: string; bio: string; avatar_url: string; linkedin_url: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [avatar, setAvatar] = useState(initial?.avatar_url ?? "");
  const [linkedin, setLinkedin] = useState(initial?.linkedin_url ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), bio: bio.trim(), avatar_url: avatar, linkedin_url: linkedin.trim() });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-[#111111]/10 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-[#111111]">{initial?.id ? "Edit author" : "New author"}</h3>
        <button type="button" onClick={onCancel} className="grid h-8 w-8 place-items-center rounded-md text-[#5F686A] hover:bg-gray-100">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex items-start gap-6">
          <div className="shrink-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]">Photo</p>
            <ImageUpload
              value={avatar}
              onChange={setAvatar}
              circular
              aspectClass="h-20 w-20"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-md border border-[#111111]/15 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#122428]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-md border border-[#111111]/15 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#122428]"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]">
            About
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short bio shown with posts…"
            className="w-full resize-y rounded-md border border-[#111111]/15 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#122428]"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded-md bg-[#122428] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save author"}
          </button>
          <button type="button" onClick={onCancel} className="rounded-md border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#5F686A]">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/authors");
    const json = await res.json() as { data: Author[] };
    setAuthors(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createAuthor = async (data: { name: string; bio: string; avatar_url: string; linkedin_url: string }) => {
    await fetch("/api/admin/authors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    load();
  };

  const updateAuthor = async (id: string, data: { name: string; bio: string; avatar_url: string; linkedin_url: string }) => {
    await fetch(`/api/admin/authors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditingId(null);
    load();
  };

  const deleteAuthor = async (id: string) => {
    if (!confirm("Delete this author? Their posts will lose the author attribution.")) return;
    await fetch(`/api/admin/authors/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#122428]">VAxAI Studio</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Author profiles</h1>
        <p className="mt-0.5 text-sm text-[#5F686A]">Create author profiles to attribute posts. Each profile is shown on the published post.</p>
      </div>

      <div className="mx-auto max-w-2xl px-8 py-8">
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-sm text-[#5F686A]">Loading…</div>
          ) : (
            authors.map((author) =>
              editingId === author.id ? (
                <AuthorForm
                  key={author.id}
                  initial={author}
                  onSave={(data) => updateAuthor(author.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  key={author.id}
                  className="flex items-start gap-4 rounded-md border border-[#111111]/10 bg-white p-5 shadow-sm"
                >
                  {author.avatar_url ? (
                    <img
                      src={author.avatar_url}
                      alt={author.name}
                      className="h-12 w-12 shrink-0 rounded-full object-cover border border-[#111111]/10"
                    />
                  ) : (
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#122428] text-lg font-semibold text-[#D8FC2E]">
                      {author.name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#111111]">{author.name}</p>
                    {author.bio && (
                      <p className="mt-1 text-sm leading-5 text-[#5F686A] line-clamp-2">{author.bio}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => setEditingId(author.id)}
                      className="grid h-8 w-8 place-items-center rounded-md text-[#5F686A] hover:bg-[#F5F8F8] hover:text-[#111111]"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteAuthor(author.id)}
                      className="grid h-8 w-8 place-items-center rounded-md text-[#5F686A] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            )
          )}

          {showForm && !editingId && (
            <AuthorForm onSave={createAuthor} onCancel={() => setShowForm(false)} />
          )}

          {!showForm && !editingId && (
            <button
              onClick={() => setShowForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#111111]/20 bg-white py-4 text-sm font-semibold text-[#5F686A] hover:border-[#122428]/40 hover:text-[#122428]"
            >
              <Plus className="h-4 w-4" />
              Add author
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

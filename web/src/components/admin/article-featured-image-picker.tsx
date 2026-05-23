"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, RefreshCw, Search, Upload, Save } from "lucide-react";
import { isNextImageOptimizableHost } from "@/lib/image-utils";

type Props = {
  articleId: string;
  niche: string;
  title: string;
  featuredImage: string | null;
  featuredImagePrompt: string | null;
  onChange: (image: string | null, prompt: string | null) => void;
};

export function ArticleFeaturedImagePicker({
  articleId,
  niche,
  title,
  featuredImage,
  featuredImagePrompt,
  onChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState(featuredImage ?? "");
  const [searchQuery, setSearchQuery] = useState(
    featuredImagePrompt ?? title.slice(0, 60)
  );
  const [pool, setPool] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [hasUnsplash, setHasUnsplash] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const params = new URLSearchParams({ niche });
      if (searchQuery.trim().length >= 2) params.set("q", searchQuery.trim());
      const res = await fetch(`/api/admin/featured-images?${params}`);
      if (!res.ok) throw new Error("Failed to load images");
      const data = (await res.json()) as {
        pool: string[];
        search: string[];
        hasUnsplash: boolean;
      };
      setPool(data.pool);
      setSearchResults(data.search);
      setHasUnsplash(data.hasUnsplash);
    } catch {
      setMessage("Could not load image suggestions.");
    } finally {
      setLoading(false);
    }
  }, [niche, searchQuery]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  useEffect(() => {
    setUrlInput(featuredImage ?? "");
  }, [featuredImage]);

  function selectImage(url: string, prompt?: string | null) {
    onChange(url, prompt ?? featuredImagePrompt);
    setUrlInput(url);
    setMessage("Image selected — click Save image or Save article to apply.");
  }

  function applyCustomUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      onChange(null, featuredImagePrompt);
      setMessage("Image cleared — click Save to apply.");
      return;
    }
    try {
      new URL(trimmed);
      onChange(trimmed, featuredImagePrompt);
      setMessage("Custom URL selected — click Save image or Save article to apply.");
    } catch {
      setMessage("Enter a valid image URL (https://...).");
    }
  }

  async function saveImageNow() {
    if (!featuredImage) {
      setMessage("Select or upload an image first.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featuredImage,
          featuredImagePrompt: (featuredImagePrompt ?? searchQuery.trim()) || null,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("Featured image saved. Social previews will use this image.");
    } catch {
      setMessage("Could not save image. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function generateUnique() {
    setGenerating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Generate failed");
      const data = (await res.json()) as {
        featuredImage: string;
        featuredImagePrompt: string;
      };
      onChange(data.featuredImage, data.featuredImagePrompt);
      setUrlInput(data.featuredImage);
      setSearchQuery(data.featuredImagePrompt);
      setMessage("New unique image generated — click Save image to apply.");
    } catch {
      setMessage("Could not generate image. Try again or pick manually.");
    } finally {
      setGenerating(false);
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("save", "true");

      const res = await fetch(`/api/admin/articles/${articleId}/upload-image`, {
        method: "POST",
        body: form,
      });

      const data = (await res.json()) as {
        featuredImage?: string;
        error?: string;
        saved?: boolean;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }

      if (data.featuredImage) {
        onChange(data.featuredImage, featuredImagePrompt);
        setUrlInput(data.featuredImage);
        setMessage(
          data.saved
            ? "Image uploaded and saved. It will appear when you share on social media."
            : "Image uploaded — click Save image to apply."
        );
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  const gallery = [...new Set([...searchResults, ...pool])];
  const previewSrc = featuredImage ?? (urlInput.trim() || null);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-accent" />
        <h2 className="font-semibold">Featured image</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Used on the article page and as the social share thumbnail (Facebook, X, LinkedIn).
      </p>

      <div className="relative mt-4 aspect-[900/560] w-full overflow-hidden rounded-xl border border-border bg-muted">
        {previewSrc ? (
          <Image
            src={previewSrc}
            alt="Featured preview"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 900px"
            unoptimized={!isNextImageOptimizableHost(previewSrc)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No image selected
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload image
        </button>
        <button
          type="button"
          onClick={saveImageNow}
          disabled={saving || !featuredImage}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save image
        </button>
        <button
          type="button"
          onClick={generateUnique}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Generate unique
        </button>
        <button
          type="button"
          onClick={() => onChange(null, featuredImagePrompt)}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Remove
        </button>
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium">Paste image URL</label>
        <div className="mt-2 flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 text-sm"
          />
          <button
            type="button"
            onClick={applyCustomUrl}
            className="shrink-0 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Use URL
          </button>
        </div>
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium">Search images</label>
        <div className="mt-2 flex gap-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), loadSuggestions())}
            placeholder="e.g. laptop workspace, fitness yoga"
            className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 text-sm"
          />
          <button
            type="button"
            onClick={loadSuggestions}
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </button>
        </div>
        {!hasUnsplash && (
          <p className="mt-2 text-xs text-muted-foreground">
            Add UNSPLASH_ACCESS_KEY in env for live search. Upload or curated picks still work.
          </p>
        )}
      </div>

      {message && (
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      )}

      {gallery.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-medium">
            {searchResults.length > 0 ? "Search results & curated" : "Curated for this niche"}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((url) => {
              const selected = featuredImage === url;
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => selectImage(url, searchQuery.trim() || null)}
                  className={`relative aspect-[900/560] overflow-hidden rounded-lg ring-2 transition hover:opacity-90 ${
                    selected ? "ring-accent" : "ring-transparent"
                  }`}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="200px"
                    unoptimized={!isNextImageOptimizableHost(url)}
                  />
                  {selected && (
                    <span className="absolute inset-0 flex items-center justify-center bg-accent/20 text-xs font-bold text-accent-foreground">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { compressImage, formatFileSize } from "@/lib/image-utils";
import type { CreateRecipeFormValues } from "@/types/recipes";

const LARGE_IMAGE_BYTES = 1024 * 1024;
const URL_CHECK_DEBOUNCE_MS = 500;

type RecipePhotoFieldProps = {
  values: CreateRecipeFormValues;
  isSubmitting: boolean;
  imageError?: string;
  onChange: (patch: Partial<CreateRecipeFormValues>) => void;
};

type CompressionState =
  | { status: "idle" }
  | { status: "compressing" }
  | { status: "done"; beforeBytes: number; afterBytes: number }
  | { status: "error"; message: string };

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-status-error mt-1 text-sm">{message}</p>;
}

export function RecipePhotoField({
  values,
  isSubmitting,
  imageError,
  onChange,
}: RecipePhotoFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compression, setCompression] = useState<CompressionState>({ status: "idle" });
  const [largeUrlWarning, setLargeUrlWarning] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  const showUrlPreview = values.imageMode === "url" && values.imageUrl.trim().length > 0;
  const showFilePreview = values.imageMode === "file" && values.imageFile !== null;
  const hasPreview = showUrlPreview || showFilePreview;

  useEffect(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (showFilePreview && values.imageFile) {
      const objectUrl = URL.createObjectURL(values.imageFile);
      objectUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
      return;
    }

    if (showUrlPreview) {
      setPreviewUrl(values.imageUrl.trim());
      return;
    }

    setPreviewUrl(null);
  }, [showFilePreview, showUrlPreview, values.imageFile, values.imageUrl]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (values.imageMode !== "url") {
      setLargeUrlWarning(false);
      return;
    }

    const trimmedUrl = values.imageUrl.trim();
    if (!trimmedUrl) {
      setLargeUrlWarning(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await fetch(trimmedUrl, { method: "HEAD" });
          if (cancelled) {
            return;
          }

          const contentLength = response.headers.get("content-length");
          if (!contentLength) {
            setLargeUrlWarning(false);
            return;
          }

          const size = Number.parseInt(contentLength, 10);
          setLargeUrlWarning(Number.isFinite(size) && size > LARGE_IMAGE_BYTES);
        } catch {
          if (!cancelled) {
            setLargeUrlWarning(false);
          }
        }
      })();
    }, URL_CHECK_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [values.imageMode, values.imageUrl]);

  function handleClearPhoto() {
    onChange({
      imageUrl: "",
      imageFile: null,
      imageCleared: true,
    });
    setCompression({ status: "idle" });
    setLargeUrlWarning(false);
  }

  async function handleFileChange(file: File | null) {
    if (!file) {
      onChange({ imageFile: null });
      setCompression({ status: "idle" });
      return;
    }

    setCompression({ status: "compressing" });
    const beforeBytes = file.size;

    try {
      const compressed = await compressImage(file);
      onChange({
        imageFile: compressed,
        imageCleared: false,
        imageUrl: "",
      });
      setCompression({
        status: "done",
        beforeBytes,
        afterBytes: compressed.size,
      });
    } catch {
      onChange({
        imageFile: file,
        imageCleared: false,
        imageUrl: "",
      });
      setCompression({
        status: "error",
        message: "Compression impossible, le fichier original sera utilisé.",
      });
    }
  }

  return (
    <div className="space-y-3">
      {hasPreview && previewUrl ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Prévisualisation de la photo"
            className="h-32 w-32 rounded-sm border border-[var(--border-hairline)] object-cover sm:h-40 sm:w-40"
          />
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClearPhoto}
            className="btn-icon absolute right-1 top-1 h-8 w-8 min-h-8 min-w-8 rounded-full bg-[var(--foreground)]/80 text-[var(--background)]"
            aria-label="Supprimer la photo"
          >
            <Icon icon={X} size="sm" />
          </button>
        </div>
      ) : (
        <div className="flex h-32 w-32 items-center justify-center rounded-sm border border-dashed border-[var(--border-hairline)] bg-[var(--surface-muted)] sm:h-40 sm:w-40">
          <span className="text-caption text-[var(--muted)]">Sans image</span>
        </div>
      )}

      <div className="flex gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="imageMode"
            checked={values.imageMode === "url"}
            disabled={isSubmitting}
            onChange={() => onChange({ imageMode: "url" })}
          />
          URL
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="imageMode"
            checked={values.imageMode === "file"}
            disabled={isSubmitting}
            onChange={() => onChange({ imageMode: "file" })}
          />
          Fichier
        </label>
      </div>

      {values.imageMode === "url" ? (
        <label className="block space-y-2">
          <span className="input-label">URL de la photo</span>
          <input
            type="url"
            value={values.imageUrl}
            disabled={isSubmitting}
            onChange={(event) =>
              onChange({
                imageUrl: event.target.value,
                imageCleared: false,
              })
            }
            className="input-field"
            placeholder="https://…"
          />
          {largeUrlWarning ? (
            <p className="text-caption text-[var(--status-warning)]" role="status">
              Cette image est volumineuse, les performances peuvent être affectées
            </p>
          ) : null}
          <FieldError message={imageError} />
        </label>
      ) : (
        <label className="block space-y-2">
          <span className="input-label">Fichier image</span>
          <input
            type="file"
            accept="image/*,image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            disabled={isSubmitting || compression.status === "compressing"}
            onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
            className="input-field"
          />
          {compression.status === "compressing" ? (
            <p className="text-caption flex items-center gap-2 text-[var(--muted)]" role="status">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Compression en cours…
            </p>
          ) : null}
          {compression.status === "done" ? (
            <p className="text-caption text-[var(--muted)]" role="status">
              {formatFileSize(compression.beforeBytes)} → {formatFileSize(compression.afterBytes)} ✓
            </p>
          ) : null}
          {compression.status === "error" ? (
            <p className="text-caption text-[var(--status-warning)]" role="status">
              {compression.message}
            </p>
          ) : null}
          <FieldError message={imageError} />
        </label>
      )}
    </div>
  );
}

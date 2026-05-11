"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, UploadCloud } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants/app-config";
import { cn } from "@/lib/utils/cn";
import { usePatternStore } from "@/stores/pattern-store";

type UploadDropzoneProps = {
  variant?: "hero" | "page";
  redirectAfterSelect?: boolean;
  className?: string;
};

function validateUploadFile(file: File) {
  const acceptedTypes = APP_CONFIG.acceptedImageTypes as readonly string[];
  const maxBytes = APP_CONFIG.maxUploadSizeMb * 1024 * 1024;

  if (!acceptedTypes.includes(file.type)) {
    return "请上传 JPG、PNG 或 WEBP 格式的图片";
  }

  if (file.size > maxBytes) {
    return `图片不能超过 ${APP_CONFIG.maxUploadSizeMb}MB`;
  }

  return null;
}

export function UploadDropzone({
  variant = "page",
  redirectAfterSelect = false,
  className
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const { setSourceFile, uploadError, setUploadError } = usePatternStore();

  function handleFile(file?: File) {
    if (!file) return;

    const validationMessage = validateUploadFile(file);
    if (validationMessage) {
      setUploadError(validationMessage);
      return;
    }

    setSourceFile(file);

    if (redirectAfterSelect) {
      router.push("/workspace/upload");
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-dashed border-milk-purple-light/80 bg-gradient-to-br from-white via-milk-purple-soft/40 to-white p-5 text-center shadow-insetSoft transition",
        variant === "page" ? "min-h-[280px]" : "min-h-[210px]",
        isDragging && "scale-[1.01] border-milk-purple bg-milk-purple-soft shadow-bead",
        className
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFile(event.dataTransfer.files?.[0]);
      }}
    >
      <span className="bead-sparkle left-6 top-6 h-5 w-5" style={{ "--bead-color": "#FB7185" } as React.CSSProperties} />
      <span className="bead-sparkle right-8 top-8 h-4 w-4" style={{ "--bead-color": "#60A5FA" } as React.CSSProperties} />
      <span className="bead-sparkle bottom-7 right-16 h-4 w-4" style={{ "--bead-color": "#FBBF24" } as React.CSSProperties} />

      <div className="relative z-10 flex h-full min-h-[inherit] flex-col items-center justify-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-button text-white shadow-bead">
          <UploadCloud className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black text-bean-ink">拖拽图片到这里</h2>
        <p className="mt-2 text-sm font-medium text-bean-muted">
          支持 JPG、PNG、WEBP 格式，最大 {APP_CONFIG.maxUploadSizeMb}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <button className="primary-button mt-5" type="button" onClick={() => inputRef.current?.click()}>
          <ImagePlus className="h-5 w-5" />
          上传图片
        </button>
        {uploadError ? (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-bean-danger">
            {uploadError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

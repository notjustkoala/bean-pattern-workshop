import type { GeneratedPattern } from "@/types/pattern";
import { drawPatternPreview } from "./preview";

export type PatternExportOptions = {
  cellSize?: number;
  showSymbols?: boolean;
  fileName?: string;
};

export function createPatternCanvas(pattern: GeneratedPattern, options: PatternExportOptions = {}) {
  const canvas = document.createElement("canvas");
  drawPatternPreview(canvas, pattern.cells, {
    cellSize: options.cellSize ?? 18,
    showSymbols: options.showSymbols ?? true
  });
  return canvas;
}

export function downloadUrl(url: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function downloadPatternPng(pattern: GeneratedPattern, options: PatternExportOptions = {}) {
  const canvas = createPatternCanvas(pattern, options);
  const url = canvas.toDataURL("image/png");
  downloadUrl(url, options.fileName ?? "bean-pattern.png");
}

function asciiBytes(value: string) {
  return new TextEncoder().encode(value);
}

function concatBytes(parts: Uint8Array[]) {
  const totalLength = parts.reduce((total, part) => total + part.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }

  return merged;
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function createPatternPdfBlob(pattern: GeneratedPattern) {
  const canvas = createPatternCanvas(pattern, { cellSize: pattern.width > 48 ? 10 : 14, showSymbols: false });
  const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const jpegBytes = base64ToBytes(jpegDataUrl.split(",")[1]);
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 48;
  const imageMaxWidth = pageWidth - margin * 2;
  const imageMaxHeight = 520;
  const imageRatio = canvas.width / canvas.height;
  let imageWidth = imageMaxWidth;
  let imageHeight = imageWidth / imageRatio;

  if (imageHeight > imageMaxHeight) {
    imageHeight = imageMaxHeight;
    imageWidth = imageHeight * imageRatio;
  }

  const imageX = (pageWidth - imageWidth) / 2;
  const imageY = 210;
  const lines = [
    "Bean Pattern Workshop",
    `Grid: ${pattern.width} x ${pattern.height}`,
    `Total beads: ${pattern.totalBeads}`,
    `Colors: ${pattern.colorCount}`,
    `Materials: ${pattern.materials.length} items`
  ];
  const textCommands = lines
    .map((line, index) => `BT /F1 ${index === 0 ? 20 : 12} Tf 48 ${790 - index * 24} Td (${escapePdfText(line)}) Tj ET`)
    .join("\n");
  const content = `${textCommands}\nq\n${imageWidth.toFixed(2)} 0 0 ${imageHeight.toFixed(2)} ${imageX.toFixed(2)} ${imageY.toFixed(2)} cm\n/Im0 Do\nQ\n`;

  const objects: Array<string | Uint8Array> = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R >> /XObject << /Im0 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
    concatBytes([
      asciiBytes(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`),
      jpegBytes,
      asciiBytes(`\nendstream\nendobj\n`)
    ]),
    `6 0 obj\n<< /Length ${asciiBytes(content).length} >>\nstream\n${content}endstream\nendobj\n`
  ];

  const parts: Uint8Array[] = [asciiBytes("%PDF-1.4\n")];
  const offsets = [0];
  let byteOffset = parts[0].length;

  for (const object of objects) {
    offsets.push(byteOffset);
    const bytes = typeof object === "string" ? asciiBytes(object) : object;
    parts.push(bytes);
    byteOffset += bytes.length;
  }

  const xrefOffset = byteOffset;
  const xrefEntries = offsets
    .map((offset, index) => (index === 0 ? "0000000000 65535 f " : `${String(offset).padStart(10, "0")} 00000 n `))
    .join("\n");
  const trailer = `xref\n0 ${objects.length + 1}\n${xrefEntries}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  parts.push(asciiBytes(trailer));

  return new Blob([concatBytes(parts)], { type: "application/pdf" });
}

export function downloadPatternPdf(pattern: GeneratedPattern, fileName = "bean-pattern.pdf") {
  const blob = createPatternPdfBlob(pattern);
  const url = URL.createObjectURL(blob);
  downloadUrl(url, fileName);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

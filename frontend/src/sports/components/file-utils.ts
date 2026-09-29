import type { SportsFile } from "@/types";

export function formatFileSize(sizeKb: number): string {
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${sizeKb} KB`;
}

export async function downloadFile(file: SportsFile) {
  if (file.fileUrl) {
    try {
      const response = await fetch(file.fileUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = file.name;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.warn("Real file download failed, falling back to mock:", err);
    }
  }

  const content = `[Unify demo] "${file.name}"\nType: ${file.type}\nSize: ${formatFileSize(file.sizeKb)}\nFolder: ${file.folder}\nUploaded by: ${file.uploadedBy}\n`;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name.endsWith(".txt") ? file.name : `${file.name}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const downloadMockFile = downloadFile;


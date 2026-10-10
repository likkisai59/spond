import type { SportsFile } from "@/types";
import { apiClient } from "@/services/api-client";
import { API_BASE_URL } from "@/utils/constants";

export function formatFileSize(sizeKb: number): string {
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${sizeKb} KB`;
}

export async function downloadFile(file: SportsFile) {
  let targetUrl = file.fileUrl || "";

  if (file.id) {
    try {
      const res = await apiClient.get(`/api/v1/files/download/${file.id}`);
      const downloadUrl = res.data?.data?.downloadUrl || res.data?.data?.download_url;
      if (downloadUrl) {
        targetUrl = downloadUrl;
      }
    } catch (_err) {
      // fallback to file.fileUrl
    }
  }

  if (targetUrl.includes("amazonaws.com") && !targetUrl.includes("X-Amz-Signature")) {
    targetUrl = `${API_BASE_URL}/api/v1/files/redirect?url=${encodeURIComponent(targetUrl)}`;
  } else if (targetUrl.startsWith("/")) {
    targetUrl = `${API_BASE_URL}${targetUrl}`;
  }

  if (targetUrl) {
    try {
      const response = await fetch(targetUrl);
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
    } catch (_err) {
      // Direct anchor click bypasses browser CORS for S3 presigned URLs
      const anchor = document.createElement("a");
      anchor.href = targetUrl;
      anchor.download = file.name;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = targetUrl;
    anchor.download = file.name;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return;
  }

  const content = `[Unify demo] "${file.name}"\nType: ${file.type}\nSize: ${formatFileSize(file.sizeKb)}\nFolder: ${file.folder}\nUploaded by: ${file.uploadedBy}\n`;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const downloadMockFile = downloadFile;


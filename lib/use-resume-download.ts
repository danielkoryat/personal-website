"use client";

import { useCallback, useState } from "react";

export type ResumeFormat = "pdf" | "docx";

/**
 * Downloads the resume through the API route, reporting progress and failures
 * as state instead of `alert()`. Shared by the hero and contact sections.
 */
export function useResumeDownload() {
  const [pending, setPending] = useState<ResumeFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async (format: ResumeFormat = "pdf") => {
    setPending(format);
    setError(null);

    let objectUrl: string | undefined;

    try {
      const response = await fetch(`/api/resume?format=${format}`);

      if (!response.ok) {
        setError(
          response.status === 404
            ? `No ${format.toUpperCase()} resume available yet — email me and I'll send it over.`
            : "Couldn't fetch the resume. Please try again."
        );
        return;
      }

      const blob = await response.blob();
      objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `Daniel_Koryat_Resume.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (cause) {
      console.error("Resume download failed:", cause);
      setError("Couldn't reach the server. Please try again.");
    } finally {
      // Revoke after the click has been handed to the browser.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setPending(null);
    }
  }, []);

  return { download, pending, error, clearError: () => setError(null) };
}

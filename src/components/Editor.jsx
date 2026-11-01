import React, { useCallback } from "react";

const EXTERNAL_LINK_RE = /^(https?:|mailto:|tel:)/i;

async function openExternal(url) {
  if (window.__TAURI_INTERNALS__) {
    try {
      const { openUrl } = await import("@tauri-apps/plugin-opener");
      await openUrl(url);
      return;
    } catch (err) {
      console.warn("Open URL failed:", err);
    }
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function Editor({ html, zoom = 100, fontFamily = "system-ui", fontSize = 16, onContextMenu }) {
  const scale = zoom / 100;

  const handleClick = useCallback((event) => {
    const anchor = event.target.closest?.("a[href]");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (href.startsWith("#")) return;
    event.preventDefault();
    if (EXTERNAL_LINK_RE.test(href)) openExternal(href);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--color-canvas-inset)]" onContextMenu={onContextMenu} onClick={handleClick}>
      <div
        className="max-w-[1200px] mx-auto min-h-full bg-[var(--color-canvas-default)] border-x border-[var(--color-border-subtle)]"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          width: `${100 / scale}%`,
          fontFamily: fontFamily,
          fontSize: `${fontSize}px`,
        }}
      >
        <div className="tiptap" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

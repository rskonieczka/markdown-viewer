import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

export function useMarkdownEditor({ initialContent }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "code-block",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Table,
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: initialContent || "",
    editable: false,
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
  });

  return editor;
}

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

export default function Editor({ editor, zoom = 100, fontFamily = "system-ui", fontSize = 16, onContextMenu }) {
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
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div className="p-8 space-y-4 animate-pulse">
            <div className="h-8 rounded w-2/5 bg-[var(--color-neutral-muted)]" />
            <div className="h-4 rounded w-full bg-[var(--color-neutral-muted)]" />
            <div className="h-4 rounded w-4/5 bg-[var(--color-neutral-muted)]" />
            <div className="h-4 rounded w-3/5 bg-[var(--color-neutral-muted)]" />
          </div>
        )}
      </div>
    </div>
  );
}

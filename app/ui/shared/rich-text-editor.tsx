// components/rich-editor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorToolbar } from "./tip-tap-toolbar";
import { cn } from "@/lib/utils";

export function RichEditor({
  value = '',
  invalid,
  onChange
}: {
  value?: string;
  invalid?: boolean;
  onChange?: (content: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  return (
    <div className={`border rounded-md overflow-hidden ${invalid ? "border-destructive" : "border-input"}`}>
      <EditorToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert max-w-none px-3 py-1 min-h-[200px] focus-within:outline-none text-[14px]
          [&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none"
      />
    </div>
  );
}
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorToolbar } from "./tip-tap-toolbar";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";

export function RichEditor({
  value = '',
  placeholder = '',
  invalid,
  onChange
}: {
  value?: string;
  placeholder?: string;
  invalid?: boolean;
  onChange?: (content: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML().replace(/<p><\/p>/g, "<p>&nbsp;</p>"));
    },
  });

  return (
    <div className={`border rounded-md overflow-hidden ${invalid ? "border-destructive" : "border-input"}`}>
      <EditorToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert max-w-none px-3 py-2 min-h-[200px] focus-within:outline-none text-[14px]
          [&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
      />
    </div>
  );
}
"use client";
// app/admin/productos/components/EditorDescripcion.tsx
// ─────────────────────────────────────────────────────────────
// Editor de texto enriquecido con TipTap para descripcion_larga.
// ─────────────────────────────────────────────────────────────
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit                   from "@tiptap/starter-kit";
import Placeholder                  from "@tiptap/extension-placeholder";
import { SectionCard }              from "./producto-form-ui";

/* ── Barra de herramientas ─────────────────────────────────── */
function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick:   () => void;
  active?:   boolean;
  disabled?: boolean;
  title:     string;
  children:  React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-md text-sm transition ${
        active
          ? "bg-indigo-100 text-indigo-600"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

/* ── Props ─────────────────────────────────────────────────── */
interface Props {
  value:    string;
  onChange: (html: string) => void;
}

/* ── Componente ────────────────────────────────────────────── */
export function EditorDescripcion({ value, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Escribe una descripción detallada del producto...",
      }),
    ],
    content:             value || "",
    onUpdate:            ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[360px] px-4 py-3 focus:outline-none text-slate-700",
      },
    },
  });

  if (!editor) return null;

  return (
    <SectionCard title="Descripción">
      {/* Editor enriquecido */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">Descripción completa</label>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 pb-3 mb-1 border-b border-slate-100">

        {/* Párrafo / Headings */}
        <ToolbarBtn
          title="Párrafo"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </ToolbarBtn>

        <ToolbarBtn
          title="Título H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <span className="text-xs font-bold leading-none">H2</span>
        </ToolbarBtn>

        <ToolbarBtn
          title="Título H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <span className="text-xs font-bold leading-none">H3</span>
        </ToolbarBtn>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        {/* Formato inline */}
        <ToolbarBtn
          title="Negrita"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/>
            <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/>
          </svg>
        </ToolbarBtn>

        <ToolbarBtn
          title="Cursiva"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="19" y1="4" x2="10" y2="4" strokeWidth={2} strokeLinecap="round"/>
            <line x1="14" y1="20" x2="5" y2="20" strokeWidth={2} strokeLinecap="round"/>
            <line x1="15" y1="4" x2="9" y2="20" strokeWidth={2} strokeLinecap="round"/>
          </svg>
        </ToolbarBtn>

        <ToolbarBtn
          title="Tachado"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.3 12H6.7M12 6.7c-2.2 0-4 .9-4 2.8 0 .7.3 1.3.8 1.8M12 17.3c2.5 0 4.3-1.1 4.3-3.1" />
          </svg>
        </ToolbarBtn>

        <ToolbarBtn
          title="Código inline"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="16 18 22 12 16 6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="8 6 2 12 8 18"  strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolbarBtn>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        {/* Listas */}
        <ToolbarBtn
          title="Lista con viñetas"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="9" y1="6"  x2="20" y2="6"  strokeWidth={2} strokeLinecap="round"/>
            <line x1="9" y1="12" x2="20" y2="12" strokeWidth={2} strokeLinecap="round"/>
            <line x1="9" y1="18" x2="20" y2="18" strokeWidth={2} strokeLinecap="round"/>
            <circle cx="4" cy="6"  r="1" fill="currentColor"/>
            <circle cx="4" cy="12" r="1" fill="currentColor"/>
            <circle cx="4" cy="18" r="1" fill="currentColor"/>
          </svg>
        </ToolbarBtn>

        <ToolbarBtn
          title="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="10" y1="6"  x2="21" y2="6"  strokeWidth={2} strokeLinecap="round"/>
            <line x1="10" y1="12" x2="21" y2="12" strokeWidth={2} strokeLinecap="round"/>
            <line x1="10" y1="18" x2="21" y2="18" strokeWidth={2} strokeLinecap="round"/>
            <path d="M4 6h1v4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 10h2"  strokeWidth={2} strokeLinecap="round"/>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolbarBtn>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        {/* Bloque de cita */}
        <ToolbarBtn
          title="Cita"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
          </svg>
        </ToolbarBtn>

        <ToolbarBtn
          title="Bloque de código"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="2" y="3" width="20" height="18" rx="2" strokeWidth={2}/>
            <path d="M8 10l-3 3 3 3M16 10l3 3-3 3M12 8l-2 8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolbarBtn>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        {/* Deshacer / Rehacer */}
        <ToolbarBtn
          title="Deshacer"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6" />
          </svg>
        </ToolbarBtn>

        <ToolbarBtn
          title="Rehacer"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6M21 10l-6-6" />
          </svg>
        </ToolbarBtn>

      </div>

      {/* Área de edición */}
      <div className="rounded-lg border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition">
        <EditorContent editor={editor} />
      </div>

      </div>{/* fin editor enriquecido */}

      {/* Estilos del editor */}
      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #cbd5e1;
          pointer-events: none;
          height: 0;
        }
        .tiptap h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.25rem; color: #1e293b; }
        .tiptap h3 { font-size: 1.05rem; font-weight: 600; margin: 0.5rem 0 0.25rem; color: #1e293b; }
        .tiptap p  { margin: 0.25rem 0; }
        .tiptap ul { list-style: disc;    padding-left: 1.25rem; margin: 0.25rem 0; }
        .tiptap ol { list-style: decimal; padding-left: 1.25rem; margin: 0.25rem 0; }
        .tiptap li { margin: 0.1rem 0; }
        .tiptap blockquote { border-left: 3px solid #e2e8f0; padding-left: 0.75rem; color: #64748b; margin: 0.5rem 0; }
        .tiptap code { background: #f1f5f9; border-radius: 0.25rem; padding: 0.1rem 0.3rem; font-size: 0.8rem; color: #6366f1; }
        .tiptap pre  { background: #1e293b; color: #e2e8f0; border-radius: 0.5rem; padding: 0.75rem 1rem; margin: 0.5rem 0; overflow-x: auto; }
        .tiptap pre code { background: none; color: inherit; padding: 0; }
        .tiptap strong { font-weight: 700; }
        .tiptap em     { font-style: italic; }
        .tiptap s      { text-decoration: line-through; }
      `}</style>
    </SectionCard>
  );
}
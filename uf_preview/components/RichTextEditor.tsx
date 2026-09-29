"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";
import {
  BiUndo, BiRedo, BiBold, BiItalic, BiUnderline,
  BiStrikethrough, BiCode, BiListUl, BiListOl, BiLink, BiImage,
} from "react-icons/bi";
import { BsCodeSlash, BsBlockquoteLeft } from "react-icons/bs";
import { RiLineHeight } from "react-icons/ri";
import { MdFormatColorText, MdHorizontalRule } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";

// ─── Primitive toolbar button ─────────────────────────────────────────────────

const Btn: React.FC<{
  onMouseDown: (e: React.MouseEvent) => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}> = ({ onMouseDown, active = false, title, children }) => (
  <button
    type="button"
    onMouseDown={onMouseDown}
    title={title}
    className={`flex items-center justify-center w-7 h-7 rounded text-[15px] transition-colors cursor-pointer
      ${active
        ? "bg-blue-100 text-blue-600"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
  >
    {children}
  </button>
);

const Sep = () => <div className="w-px h-5 bg-gray-200 mx-0.5 self-center" />;

// ─── Toolbar ──────────────────────────────────────────────────────────────────

interface ToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  emitChange: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ editorRef, emitChange }) => {
  const [showFormat, setShowFormat] = useState(false);
  const [showLineH, setShowLineH] = useState(false);
  const [color, setColor] = useState("#000000");
  const [fmt, setFmt] = useState("Normal text");
  const [active, setActive] = useState({
    bold: false, italic: false, underline: false,
    strike: false, ul: false, ol: false, blockquote: false,
  });

  const colorRef = useRef<HTMLInputElement>(null);
  const fmtRef = useRef<HTMLDivElement>(null);
  const lineHRef = useRef<HTMLDivElement>(null);
  const fmtBtnRef = useRef<HTMLButtonElement>(null);
  const lineHBtnRef = useRef<HTMLButtonElement>(null);
  const [fmtPos, setFmtPos] = useState<{ top: number; left: number } | null>(null);
  const [lineHPos, setLineHPos] = useState<{ top: number; left: number } | null>(null);

  // Sync toolbar state with cursor position
  useEffect(() => {
    const sync = () => {
      try {
        setActive({
          bold: document.queryCommandState("bold"),
          italic: document.queryCommandState("italic"),
          underline: document.queryCommandState("underline"),
          strike: document.queryCommandState("strikeThrough"),
          ul: document.queryCommandState("insertUnorderedList"),
          ol: document.queryCommandState("insertOrderedList"),
          blockquote: isInsideTag("BLOCKQUOTE"),
        });
        const block = document.queryCommandValue("formatBlock").toLowerCase();
        setFmt(
          block === "h1" ? "Heading 1" :
          block === "h2" ? "Heading 2" :
          block === "h3" ? "Heading 3" :
          "Normal text"
        );
      } catch (_) {}
    };
    document.addEventListener("selectionchange", sync);
    return () => document.removeEventListener("selectionchange", sync);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (fmtRef.current && !fmtRef.current.contains(e.target as Node)) setShowFormat(false);
      if (lineHRef.current && !lineHRef.current.contains(e.target as Node)) setShowLineH(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function isInsideTag(tagName: string): boolean {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
    while (node) {
      if ((node as HTMLElement).nodeName === tagName) return true;
      node = node.parentNode;
    }
    return false;
  }

  const focus = () => editorRef.current?.focus();

  const exec = (e: React.MouseEvent, cmd: string, val?: string) => {
    e.preventDefault();
    focus();
    document.execCommand(cmd, false, val ?? undefined);
    emitChange();
  };

  const applyFormat = (e: React.MouseEvent, tag: string) => {
    exec(e, "formatBlock", tag);
    setShowFormat(false);
  };

  const applyLineHeight = (e: React.MouseEvent, lh: string) => {
    e.preventDefault();
    focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
      while (node && node !== editorRef.current) {
        const el = node as HTMLElement;
        if (["P", "H1", "H2", "H3", "LI", "BLOCKQUOTE", "DIV"].includes(el.nodeName)) {
          el.style.lineHeight = lh;
          break;
        }
        node = node.parentNode;
      }
    }
    setShowLineH(false);
    emitChange();
  };

  const insertInlineCode = (e: React.MouseEvent) => {
    e.preventDefault();
    focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const text = range.toString() || "code";
    const code = document.createElement("code");
    code.textContent = text;
    range.deleteContents();
    range.insertNode(code);
    sel.removeAllRanges();
    const r = document.createRange();
    r.selectNodeContents(code);
    sel.addRange(r);
    emitChange();
  };

  const insertCodeBlock = (e: React.MouseEvent) => {
    e.preventDefault();
    focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const text = range.toString() || "// code here";
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = text;
    pre.appendChild(code);
    range.deleteContents();
    range.insertNode(pre);
    // Place cursor after pre
    const r = document.createRange();
    r.setStartAfter(pre);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
    emitChange();
  };

  const toggleBlockquote = (e: React.MouseEvent) => {
    e.preventDefault();
    focus();
    // Check if already inside a blockquote and unwrap
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
      while (node && node !== editorRef.current) {
        if ((node as HTMLElement).nodeName === "BLOCKQUOTE") {
          const bq = node as HTMLElement;
          const parent = bq.parentNode;
          if (parent) {
            while (bq.firstChild) parent.insertBefore(bq.firstChild, bq);
            parent.removeChild(bq);
          }
          emitChange();
          return;
        }
        node = node.parentNode;
      }
    }
    document.execCommand("formatBlock", false, "blockquote");
    emitChange();
  };

  const handleLink = (e: React.MouseEvent) => {
    e.preventDefault();
    focus();
    const url = window.prompt("Enter URL:", "https://");
    if (url === null) return;
    if (url === "") {
      document.execCommand("unlink");
    } else {
      document.execCommand("createLink", false, url);
      // Make link open in new tab
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        let node: Node | null = sel.anchorNode;
        while (node && node !== editorRef.current) {
          if ((node as HTMLElement).nodeName === "A") {
            (node as HTMLAnchorElement).target = "_blank";
            (node as HTMLAnchorElement).rel = "noopener noreferrer";
            break;
          }
          node = node.parentNode;
        }
      }
    }
    emitChange();
  };

  const handleImage = (e: React.MouseEvent) => {
    e.preventDefault();
    focus();
    const url = window.prompt("Enter image URL:");
    if (url) {
      document.execCommand("insertImage", false, url);
      emitChange();
    }
  };

  const handleHighlight = (e: React.MouseEvent) => {
    e.preventDefault();
    focus();
    document.execCommand("hiliteColor", false, "#fef08a");
    emitChange();
  };

  // ── JSX ──────────────────────────────────────────────────────────────────────

  return (
    <div className="flex items-center flex-nowrap gap-0.5 px-3 py-2 bg-white border-b border-gray-200 select-none overflow-x-auto">

      {/* Undo / Redo */}
      <Btn onMouseDown={(e) => exec(e, "undo")} title="Undo"><BiUndo /></Btn>
      <Btn onMouseDown={(e) => exec(e, "redo")} title="Redo"><BiRedo /></Btn>

      <Sep />

      {/* Text format dropdown */}
      <div ref={fmtRef}>
        <button
          ref={fmtBtnRef}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            if (!showFormat) {
              const rect = fmtBtnRef.current?.getBoundingClientRect();
              if (rect) setFmtPos({ top: rect.bottom + 4, left: rect.left });
            }
            setShowFormat((v) => !v);
          }}
          className="flex items-center gap-1 px-2 py-1 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <span className="min-w-[78px] text-left leading-none">{fmt}</span>
          <IoChevronDown size={12} className="text-gray-400 flex-shrink-0" />
        </button>
        {showFormat && fmtPos && (
          <div
            style={{ position: "fixed", top: fmtPos.top, left: fmtPos.left }}
            className="bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[140px] py-1"
          >
            {[
              { label: "Normal text", tag: "p" },
              { label: "Heading 1", tag: "h1" },
              { label: "Heading 2", tag: "h2" },
              { label: "Heading 3", tag: "h3" },
            ].map((f) => (
              <button
                key={f.tag}
                type="button"
                onMouseDown={(e) => applyFormat(e, f.tag)}
                className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors
                  ${fmt === f.label ? "text-blue-600 font-medium" : "text-gray-700"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Line height dropdown */}
      <div ref={lineHRef}>
        <button
          ref={lineHBtnRef}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            if (!showLineH) {
              const rect = lineHBtnRef.current?.getBoundingClientRect();
              if (rect) setLineHPos({ top: rect.bottom + 4, left: rect.left });
            }
            setShowLineH((v) => !v);
          }}
          title="Line height"
          className="flex items-center gap-0.5 px-1.5 py-1 rounded text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <RiLineHeight size={16} />
          <IoChevronDown size={11} className="text-gray-400" />
        </button>
        {showLineH && lineHPos && (
          <div
            style={{ position: "fixed", top: lineHPos.top, left: lineHPos.left }}
            className="bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[72px] py-1"
          >
            {["1.0", "1.15", "1.5", "2.0"].map((lh) => (
              <button
                key={lh}
                type="button"
                onMouseDown={(e) => applyLineHeight(e, lh)}
                className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {lh}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text color */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); colorRef.current?.click(); }}
          title="Text color"
          className="flex items-center gap-0.5 px-1.5 py-1 rounded text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <span className="flex flex-col items-center gap-px">
            <MdFormatColorText size={15} />
            <span className="w-3.5 h-[3px] rounded-sm" style={{ backgroundColor: color }} />
          </span>
          <IoChevronDown size={11} className="text-gray-400" />
        </button>
        <input
          ref={colorRef}
          type="color"
          defaultValue={color}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          onChange={(e) => {
            setColor(e.target.value);
            focus();
            document.execCommand("foreColor", false, e.target.value);
            emitChange();
          }}
        />
      </div>

      <Sep />

      {/* Bold / Italic / Underline / Strikethrough */}
      <Btn onMouseDown={(e) => exec(e, "bold")} active={active.bold} title="Bold (Ctrl+B)"><BiBold /></Btn>
      <Btn onMouseDown={(e) => exec(e, "italic")} active={active.italic} title="Italic (Ctrl+I)"><BiItalic /></Btn>
      <Btn onMouseDown={(e) => exec(e, "underline")} active={active.underline} title="Underline (Ctrl+U)"><BiUnderline /></Btn>
      <Btn onMouseDown={(e) => exec(e, "strikeThrough")} active={active.strike} title="Strikethrough"><BiStrikethrough /></Btn>

      {/* Inline code */}
      <Btn onMouseDown={insertInlineCode} title="Inline code"><BiCode /></Btn>

      {/* Highlight */}
      <Btn onMouseDown={handleHighlight} title="Highlight">
        <span className="text-[11px] font-bold px-0.5 rounded-sm" style={{ background: "#fef08a", color: "#92400e" }}>A</span>
      </Btn>

      <Sep />

      {/* Lists */}
      <Btn onMouseDown={(e) => exec(e, "insertUnorderedList")} active={active.ul} title="Bullet list"><BiListUl /></Btn>
      <Btn onMouseDown={(e) => exec(e, "insertOrderedList")} active={active.ol} title="Ordered list"><BiListOl /></Btn>

      <Sep />

      {/* Link / Image / Code block / Blockquote / HR */}
      <Btn onMouseDown={handleLink} title="Insert link"><BiLink /></Btn>
      <Btn onMouseDown={handleImage} title="Insert image"><BiImage /></Btn>
      <Btn onMouseDown={insertCodeBlock} title="Code block"><BsCodeSlash /></Btn>
      <Btn onMouseDown={toggleBlockquote} active={active.blockquote} title="Blockquote"><BsBlockquoteLeft /></Btn>
      <Btn onMouseDown={(e) => exec(e, "insertHorizontalRule")} title="Horizontal rule"><MdHorizontalRule /></Btn>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = "",
  onChange,
  placeholder = "Start typing…",
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  className = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternal = useRef(false);

  // Set initial HTML once on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync when value changes externally (e.g. form reset)
  useEffect(() => {
    if (isInternal.current) {
      isInternal.current = false;
      return;
    }
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const emitChange = useCallback(() => {
    if (editorRef.current && onChange) {
      isInternal.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  return (
    <CommonHeaderAndTooltip
      needTooltip={needTooltip}
      tooltipProps={tooltipProps}
      headerText={headerText}
      headerPosition={headerPosition}
      className={className}
    >
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col">
        <Toolbar editorRef={editorRef} emitChange={emitChange} />

        {/* Editor area */}
        <div className="bg-[#f0f2f8] relative flex-1 overflow-y-auto min-h-0">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck
            onInput={emitChange}
            onKeyDown={(e) => {
              // Tab key inserts spaces instead of changing focus
              if (e.key === "Tab") {
                e.preventDefault();
                document.execCommand("insertText", false, "    ");
              }
            }}
            className="rich-editor min-h-full px-5 py-4 focus:outline-none text-gray-800 text-sm"
          />
          {/* Placeholder */}
          <div
            className="absolute top-4 left-5 text-gray-400 text-sm pointer-events-none select-none"
            style={{ display: editorRef.current?.textContent || value? "none" : undefined }}
            aria-hidden
          >
            {placeholder}
          </div>
        </div>
      </div>
    </CommonHeaderAndTooltip>
  );
};

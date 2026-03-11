'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import ImageExt from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useEffect, useCallback, useState } from 'react'

// ── Toolbar CSS + Editor Styles ──
const EDITOR_CSS = `
.rich-editor-wrapper {
  border: 1px solid #e0e0e8;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}
.rich-editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 8px 10px;
  background: #f8f8fc;
  border-bottom: 1px solid #e0e0e8;
  align-items: center;
}
.rich-editor-toolbar .divider {
  width: 1px;
  height: 24px;
  background: #d0d0d8;
  margin: 0 6px;
}
.rich-editor-toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  transition: all 0.15s;
}
.rich-editor-toolbar button:hover {
  background: #e8e8f0;
  color: #333;
}
.rich-editor-toolbar button.active {
  background: #6366f1;
  color: white;
}
.rich-editor-toolbar button[disabled] {
  opacity: 0.3;
  cursor: not-allowed;
}
.rich-editor-toolbar .btn-wide {
  width: auto;
  padding: 0 10px;
  font-size: 12px;
}
.tiptap-editor {
  padding: 20px 24px;
  min-height: 360px;
  max-height: 600px;
  overflow-y: auto;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.75;
  color: #1a1a2e;
  outline: none;
}
.tiptap-editor:focus {
  outline: none;
}
.tiptap-editor > *:first-child {
  margin-top: 0;
}
.tiptap-editor h1 {
  font-size: 1.8em;
  font-weight: 800;
  margin: 1.2em 0 0.5em;
  line-height: 1.3;
}
.tiptap-editor h2 {
  font-size: 1.4em;
  font-weight: 700;
  margin: 1em 0 0.4em;
  line-height: 1.35;
}
.tiptap-editor h3 {
  font-size: 1.15em;
  font-weight: 700;
  margin: 0.8em 0 0.3em;
}
.tiptap-editor p {
  margin: 0 0 0.8em;
}
.tiptap-editor ul,
.tiptap-editor ol {
  padding-left: 1.4em;
  margin: 0.5em 0 0.8em;
}
.tiptap-editor li {
  margin: 0.2em 0;
}
.tiptap-editor blockquote {
  margin: 0.8em 0;
  padding: 0.8em 1.2em;
  border-left: 4px solid #6366f1;
  background: #f8f7ff;
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: #4a4a6a;
}
.tiptap-editor code {
  background: #f0f0f8;
  padding: 0.1em 0.35em;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Fira Code', monospace;
}
.tiptap-editor pre {
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 1em;
  border-radius: 10px;
  overflow-x: auto;
  margin: 0.8em 0;
}
.tiptap-editor pre code {
  background: none;
  padding: 0;
  color: inherit;
}
.tiptap-editor hr {
  border: none;
  border-top: 1px solid #e0e0e8;
  margin: 1.5em 0;
}
.tiptap-editor a {
  color: #6366f1;
  text-decoration: underline;
  cursor: pointer;
}
.tiptap-editor img {
  max-width: 100%;
  border-radius: 8px;
  margin: 0.5em 0;
}
.tiptap-editor p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
.tiptap-editor .ProseMirror-selectednode {
  outline: 2px solid #6366f1;
  border-radius: 4px;
}
/* text align */
.tiptap-editor [style*="text-align: center"] { text-align: center; }
.tiptap-editor [style*="text-align: right"] { text-align: right; }
`

interface RichEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  editable?: boolean
}

export function RichEditor({ content, onChange, placeholder = '본문을 작성하세요...', editable = true }: RichEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: 'code-block' } },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      ImageExt.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  })

  // Sync external content changes (e.g., AI generation)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const addLink = useCallback(() => {
    if (!editor || !linkUrl) return
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    setLinkUrl('')
    setShowLinkInput(false)
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('이미지 URL을 입력하세요:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) return null

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: EDITOR_CSS }} />
      <div className="rich-editor-wrapper">
        {editable && (
          <div className="rich-editor-toolbar">
            {/* Headings */}
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}
              title="제목 1"
            >H1</button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
              title="제목 2"
            >H2</button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}
              title="제목 3"
            >H3</button>

            <div className="divider" />

            {/* Text formatting */}
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'active' : ''}
              title="굵게"
            ><b>B</b></button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'active' : ''}
              title="기울임"
            ><i>I</i></button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'active' : ''}
              title="밑줄"
            ><u>U</u></button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'active' : ''}
              title="취소선"
            ><s>S</s></button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={editor.isActive('code') ? 'active' : ''}
              title="인라인 코드"
            >&lt;/&gt;</button>

            <div className="divider" />

            {/* Lists */}
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'active' : ''}
              title="글머리 목록"
            >•</button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'active' : ''}
              title="번호 목록"
            >1.</button>

            <div className="divider" />

            {/* Block elements */}
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'active' : ''}
              title="인용구"
            >"</button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor.isActive('codeBlock') ? 'active' : ''}
              title="코드 블록"
            >{'{ }'}</button>
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="구분선"
            >—</button>

            <div className="divider" />

            {/* Alignment */}
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}
              title="왼쪽 정렬"
            >≡</button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}
              title="가운데 정렬"
            >≡</button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}
              title="오른쪽 정렬"
            >≡</button>

            <div className="divider" />

            {/* Link */}
            {showLinkInput ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="text"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addLink()}
                  style={{
                    height: 28, padding: '0 8px', border: '1px solid #ccc',
                    borderRadius: 6, fontSize: 12, width: 180,
                  }}
                  autoFocus
                />
                <button className="btn-wide" onClick={addLink}>확인</button>
                <button className="btn-wide" onClick={() => setShowLinkInput(false)}>취소</button>
              </span>
            ) : (
              <button
                onClick={() => {
                  const existing = editor.getAttributes('link').href || ''
                  setLinkUrl(existing)
                  setShowLinkInput(true)
                }}
                className={editor.isActive('link') ? 'active btn-wide' : 'btn-wide'}
                title="링크"
              >링크</button>
            )}

            {/* Image */}
            <button className="btn-wide" onClick={addImage} title="이미지">이미지</button>

            <div className="divider" />

            {/* Undo/Redo */}
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="실행 취소"
            >↩</button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="다시 실행"
            >↪</button>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

// HTML → Markdown 변환 (저장 시 사용)
export function htmlToMarkdown(html: string): string {
  if (!html) return ''
  let md = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<u>(.*?)<\/u>/gi, '$1')
    .replace(/<s>(.*?)<\/s>/gi, '~~$1~~')
    .replace(/<del>(.*?)<\/del>/gi, '~~$1~~')
    .replace(/<blockquote[^>]*><p>(.*?)<\/p><\/blockquote>/gi, '> $1\n\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<hr[^>]*\/?>/gi, '\n---\n\n')
    .replace(/<br[^>]*\/?>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return md
}

// Markdown → HTML 변환 (불러올 때 사용)
export function markdownToHtml(md: string): string {
  if (!md) return ''
  let html = md
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    .replace(/^---$/gm, '<hr>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

  html = html.replace(/((<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

  const lines = html.split('\n')
  const result: string[] = []
  for (const line of lines) {
    const t = line.trim()
    if (!t) continue
    if (/^<(h[1-3]|pre|blockquote|ul|ol|li|hr|img|table|tr|td|th|div)/.test(t) || t.startsWith('</')) {
      result.push(t)
    } else {
      result.push(`<p>${t}</p>`)
    }
  }
  return result.join('')
}

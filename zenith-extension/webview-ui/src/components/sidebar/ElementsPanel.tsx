import { vscode } from '../../bridge';
import { useSelectionStore } from '../../stores';
import { clsx } from 'clsx';

interface ElementTemplate {
  tag: string;
  label: string;
  icon: string;
  defaultText?: string;
  defaultAttrs?: Record<string, string>;
  category: 'layout' | 'text' | 'media' | 'form' | 'semantic';
}

const ELEMENTS: ElementTemplate[] = [
  // Layout
  { tag: 'div',     label: 'Div',       icon: 'ph-square',           category: 'layout' },
  { tag: 'section', label: 'Section',   icon: 'ph-layout',           category: 'layout' },
  { tag: 'article', label: 'Article',   icon: 'ph-article',          category: 'layout' },
  { tag: 'aside',   label: 'Aside',     icon: 'ph-sidebar-simple',   category: 'layout' },
  { tag: 'nav',     label: 'Nav',       icon: 'ph-navigation-arrow', category: 'layout' },
  { tag: 'header',  label: 'Header',    icon: 'ph-rows',             category: 'layout' },
  { tag: 'footer',  label: 'Footer',    icon: 'ph-rows-plus-bottom', category: 'layout' },
  { tag: 'main',    label: 'Main',      icon: 'ph-browser',          category: 'layout' },

  // Text
  { tag: 'h1',   label: 'H1',       icon: 'ph-text-h-one',          defaultText: 'Heading 1', category: 'text' },
  { tag: 'h2',   label: 'H2',       icon: 'ph-text-h-two',          defaultText: 'Heading 2', category: 'text' },
  { tag: 'h3',   label: 'H3',       icon: 'ph-text-h-three',        defaultText: 'Heading 3', category: 'text' },
  { tag: 'p',    label: 'Para',     icon: 'ph-paragraph',           defaultText: 'Paragraph text.', category: 'text' },
  { tag: 'span', label: 'Span',     icon: 'ph-text-t',              defaultText: 'Inline text', category: 'text' },
  { tag: 'a',    label: 'Link',     icon: 'ph-link',                defaultText: 'Link text', defaultAttrs: { href: '#' }, category: 'text' },
  { tag: 'code', label: 'Code',     icon: 'ph-code',                defaultText: 'code', category: 'text' },

  // Media
  { tag: 'img',   label: 'Image',   icon: 'ph-image',     defaultAttrs: { src: 'https://placehold.co/400x300', alt: 'Image' }, category: 'media' },
  { tag: 'video', label: 'Video',   icon: 'ph-video',     defaultAttrs: { controls: '' }, category: 'media' },
  { tag: 'svg',   label: 'SVG',     icon: 'ph-shapes',    category: 'media' },

  // Form
  { tag: 'button', label: 'Button', icon: 'ph-cursor-click', defaultText: 'Click me', category: 'form' },
  { tag: 'input',  label: 'Input',  icon: 'ph-textbox',      defaultAttrs: { type: 'text', placeholder: 'Enter text...' }, category: 'form' },
  { tag: 'textarea', label: 'Textarea', icon: 'ph-text-align-left', category: 'form' },
  { tag: 'select',   label: 'Select',   icon: 'ph-caret-circle-down', category: 'form' },
  { tag: 'label',    label: 'Label',    icon: 'ph-tag',                defaultText: 'Label', category: 'form' },

  // Semantic
  { tag: 'ul',  label: 'List',   icon: 'ph-list-bullets',  category: 'semantic' },
  { tag: 'ol',  label: 'Ordered', icon: 'ph-list-numbers', category: 'semantic' },
  { tag: 'li',  label: 'Item',   icon: 'ph-minus',          defaultText: 'List item', category: 'semantic' },
  { tag: 'table', label: 'Table', icon: 'ph-table',         category: 'semantic' },
  { tag: 'hr',    label: 'Divider', icon: 'ph-minus',       category: 'semantic' },
];

const CATEGORIES = [
  { id: 'layout',   label: 'Layout',   icon: 'ph-square-logo' },
  { id: 'text',     label: 'Text',     icon: 'ph-text-t' },
  { id: 'media',    label: 'Media',    icon: 'ph-image' },
  { id: 'form',     label: 'Form',     icon: 'ph-textbox' },
  { id: 'semantic', label: 'Semantic', icon: 'ph-brackets-angle' },
] as const;

/**
 * ElementsPanel — Phase A: Insert Panel
 *
 * Allows inserting new elements into the currently selected element,
 * written back to source via the Surgical Engine (AST-safe).
 *
 * Onlook-parity: This is equivalent to Onlook's "Insert" toolbar,
 * but integrated into the sidebar for a more IDE-like feel.
 *
 * Beyond Onlook: We expose semantic HTML elements (article, aside, nav, main)
 * that Onlook's UI doesn't surface, encourage semantic HTML authoring.
 */
export function ElementsPanel() {
  const selectedId = useSelectionStore(state => state.selectedId);
  const [activeCategory, setActiveCategory] = useState<string>('layout');
  const [search, setSearch] = useState('');

  const filtered = ELEMENTS.filter(el =>
    el.category === activeCategory &&
    (search === '' || el.label.toLowerCase().includes(search.toLowerCase()) || el.tag.includes(search.toLowerCase()))
  );

  const insertElement = (template: ElementTemplate) => {
    if (!selectedId) {
      // No selection: show hint
      return;
    }
    vscode.postMessage({
      type: 'structuralOperation',
      operation: 'insert',
      zenithId: selectedId,
      payload: {
        tagName: template.tag,
        textContent: template.defaultText ?? '',
        attributes: template.defaultAttrs ?? {},
        position: { type: 'append' },
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <i className="ph ph-plus-square text-white/40 text-[14px]" />
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.18em]">Insert Element</span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-1.5">
          <i className="ph ph-magnifying-glass text-[11px] text-white/20" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search elements..."
            className="bg-transparent text-[10px] text-text-primary outline-none flex-1 placeholder:text-white/20"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-0.5 mt-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
              className={clsx(
                'flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium whitespace-nowrap transition-all border',
                activeCategory === cat.id
                  ? 'bg-white/10 border-white/20 text-white/80'
                  : 'bg-transparent border-transparent text-white/30 hover:text-white/60'
              )}
            >
              <i className={`ph ${cat.icon} text-[10px]`} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Element Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {!selectedId && (
          <div className="mb-3 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-[9px] text-yellow-400 flex items-center gap-2">
            <i className="ph ph-warning text-[12px]" />
            Select an element first — new element will be inserted inside it.
          </div>
        )}

        <div className="grid grid-cols-3 gap-1.5">
          {filtered.map(el => (
            <button
              key={el.tag}
              onClick={() => insertElement(el)}
              title={`Insert <${el.tag}> into selected element`}
              className={clsx(
                'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all group',
                selectedId
                  ? 'border-white/[0.06] bg-white/[0.03] hover:bg-blue-500/10 hover:border-blue-500/30 cursor-pointer'
                  : 'border-white/[0.04] bg-white/[0.02] opacity-50 cursor-default'
              )}
            >
              <i className={clsx(
                `ph ${el.icon} text-[18px] transition-colors`,
                selectedId ? 'text-white/40 group-hover:text-blue-400' : 'text-white/20'
              )} />
              <span className="text-[9px] text-white/50 group-hover:text-white/80 font-mono leading-none">
                {el.tag}
              </span>
              <span className="text-[8px] text-white/25 group-hover:text-white/50 leading-none">
                {el.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// React import needed for useState
import { useState } from 'react';

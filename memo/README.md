# memo

`/memo/` is a buildless personal document processor for gduru. Its library uses the actual PinCon `/new` renderer, styles, physics, reflections, startup intro, calendar transitions, native dialog motion, and tilt controls, copied from `doetoeri/Pine` commit `11811129c2401965c1f93f4e2c08f5dc41639d5d`. The source modules are kept under `pincon/` without implementation changes; `library.js` adapts personal documents and their last-edited dates to that interface. The original square-cover geometry, caption, corner tools, and all three appearance switches are retained.

Core functions:

- Documents with headings, body text, bold, italic, lists, quotes, and checklists.
- Editable tables, row/column operations, header toggle, and spreadsheet TSV paste.
- Native SVG flow diagrams with editable nodes, branches, merges, and connections.
- Native SVG mind maps with editable labels and parent relationships.
- Automatic browser-local saving, undo/redo, cover colors, search, last-edited calendar, and duplication.
- Original startup intro, cover lighting, and tilt-to-swipe switches, with saved preferences and reduced-motion support.
- Versioned JSON backup/import, Markdown and text import, Markdown export, standalone HTML export with embedded fonts, and print/PDF through the browser's print dialog.

The app stores documents in IndexedDB (`gduru-memo-v1`). When IndexedDB is unavailable, it uses a guarded localStorage fallback. A synchronous draft protects pending edits during page exits. Concurrent IndexedDB edits preserve both documents by saving the stale editor's work as a copy. Documents are never sent to a server and are not synced across devices. Back up before clearing site data; importing creates new document IDs and does not replace existing documents.

`pincon/fonts/` contains the original Hangul variable and Latin regular, medium, and semibold WOFF2 faces used by PinCon. `fonts/` contains WOFF conversions of the user's provided `OpenAISans-KO-EN-Regular-400.ttf` and `OpenAISans-KO-EN-Semibold-600.ttf`, retaining the full Korean and English character set for portable documents. Typography is local throughout the interface, document body, tables, and SVG diagrams. Standalone HTML embeds both portable fonts. No framework, remote fonts, diagram CDN, or build step is required.

Files: `index.html`, `pincon/`, and `pincon-bridge.css` define the original library and its document adapter; `library.js` connects records, switches, and the calendar; `memo.css` styles document editing; `app.js` handles editing; `model.js` validates data and sanitizes rich text; `storage.js` owns saving; `diagrams.js` draws SVG; `export.js` handles portable files. Documents open in native dialogs using the original shared-cover transition. Storage schemas and existing document IDs remain unchanged.

Serve the repository root with any static HTTP server. This directory works unchanged on the repository's static hosting. Current document bounds: 500 blocks, 150 rows × 12 columns per table, 36 diagram nodes, 120 diagram connections, and a 10 MiB per-file import limit. JSON backups are the full-fidelity round trip; Markdown imports keep code fences as text rather than executing them.

The initial editor validation covered desktop and mobile editing, Korean text and formatting, TSV paste and table operations, flow/mind-map edits, reload persistence, undo/redo after saves, content search, JSON round trips, Markdown and embedded-font HTML exports, PDF rendering, rich-text sanitization, invalid-data rejection, concurrent-edit preservation, storage fallbacks, and failure reporting. The PinCon port separately checks source-file identity, module and asset resolution, and JavaScript syntax. Current visual and interaction verification is recorded in the repository-root `design-qa.md`.

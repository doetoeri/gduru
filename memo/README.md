# memo

`/memo/` is a buildless personal document processor for gduru. Its cover flow follows PinCon `/new`: a pale, uncluttered scene, square paper covers, quiet reflections, small corner tools, keyboard and touch navigation, and reduced-motion support.

Core functions:

- Documents with headings, body text, bold, italic, lists, quotes, and checklists.
- Editable tables, row/column operations, header toggle, and spreadsheet TSV paste.
- Native SVG flow diagrams with editable nodes, branches, merges, and connections.
- Native SVG mind maps with editable labels and parent relationships.
- Automatic browser-local saving, undo/redo, cover colors, search, grid view, and duplication.
- Versioned JSON backup/import, Markdown and text import, Markdown export, standalone HTML export with embedded fonts, and print/PDF through the browser's print dialog.

The app stores documents in IndexedDB (`gduru-memo-v1`). When IndexedDB is unavailable, it uses a guarded localStorage fallback. A synchronous draft protects pending edits during page exits. Concurrent IndexedDB edits preserve both documents by saving the stale editor's work as a copy. Documents are never sent to a server and are not synced across devices. Back up before clearing site data; importing creates new document IDs and does not replace existing documents.

`fonts/` contains WOFF conversions of the user's provided `OpenAISans-KO-EN-Regular-400.ttf` and `OpenAISans-KO-EN-Semibold-600.ttf`, retaining the full Korean and English character set. Typography is local throughout the interface, document body, tables, and SVG diagrams. Standalone HTML embeds both fonts. No framework, remote fonts, diagram CDN, or build step is required.

Files: `index.html` and `memo.css` define the UI; `app.js` handles editing; `model.js` validates data and sanitizes rich text; `storage.js` owns saving; `diagrams.js` draws SVG; `export.js` handles portable files.

Serve the repository root with any static HTTP server. This directory works unchanged on the repository's static hosting. Current document bounds: 500 blocks, 150 rows × 12 columns per table, 36 diagram nodes, 120 diagram connections, and a 10 MiB per-file import limit. JSON backups are the full-fidelity round trip; Markdown imports keep code fences as text rather than executing them.

Validation: Chromium 153 browser checks covered desktop (1440px) and mobile (390px), cover keyboard navigation, Korean text and formatting, TSV paste and table operations, flow/mind-map edits, reload persistence, undo/redo after saves, content search, JSON round trips, Markdown and embedded-font HTML exports, PDF rendering, untrusted rich-text sanitization, invalid-data rejection, concurrent-edit preservation, the localStorage fallback, and storage-failure reporting. No browser runtime or console errors were observed. Screenshots were inspected for layout; SVG diagrams keep readable labels and allow horizontal scrolling instead of shrinking complex maps on small screens.

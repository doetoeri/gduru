# PinCon /new → gduru /memo verification

Date: 2026-10-14. Implementation: https://www.gduru.xyz/memo. Source: https://pincon.app/new/ and `doetoeri/Pine` commit `11811129c2401965c1f93f4e2c08f5dc41639d5d`.

The library uses the original renderer, physics, lighting, intro, calendar, view transitions, dialog motion, tilt controls and fonts. Nine mirrored core files, including the Hangul variable font, were verified byte-identical to the source. The extracted intro CSS/JavaScript retain their implementation with surrounding whitespace trimmed. Latin font URLs point to local copies.

## Visual truth and evidence

QA image directory: `/workspace/scratch/98b47634ba52/qa-clone/`.

| State | Source visual truth | Implementation screenshot | Comparison evidence |
| --- | --- | --- | --- |
| Desktop covers | `source-desktop.jpg` | `memo-desktop.jpg`, `memo-desktop-final.jpg` | `comparison-desktop.jpg` |
| Mobile covers | `source-mobile.png` | `memo-mobile.png` | `comparison-mobile.png` |
| Desktop settings, three default switches | `source-settings-desktop.jpg` | `memo-settings-desktop-final.jpg` | `comparison-switches-desktop.png` |
| Mobile settings, three default switches | `source-settings.png` | `memo-settings-mobile-final.png` | `comparison-settings-mobile-full.png`, `comparison-switches-mobile.png` |
| Desktop calendar | `source-calendar-desktop.jpg` | `memo-calendar-desktop.jpg` | Full source and implementation captures inspected |
| Document editing | Source library opens a native dialog | `memo-mobile-editor.png`, `memo-flow-editor.jpg`, `memo-mindmap-editor.jpg` | Domain-specific editor retained inside original dialog motion |

All screenshots were browser-rendered through CUA. Desktop source and implementation use a 1363 × 936 CSS viewport and matching 1363 × 936 screenshot pixels. Mobile source and implementation use a 390 × 844 CSS iframe viewport. Outer screenshots are 1363 × 936 pixels; equal app-only crops produce 390 × 844 images. Both mobile crops use the same rounded iframe origin, x=487, y=20. Effective device scale factor is 1, inferred from CSS and screenshot dimensions; browser density was not altered. Mobile comparisons and focused settings crops remain 1:1. The desktop overview board scales both sides to 60%; original full-resolution captures and DOM measurements determine geometry and typography.

Full-view boards verify scene proportions, square covers, floor reflections, captions, corner controls and responsive placement. Focused boards verify all three switch rows and modal/header spacing. Measurements were taken after entrance animations settled.

## Matching measurements

| Property | Source and implementation |
| --- | --- |
| Desktop selected cover | x=491.5, y=164, width=380, height=380 |
| Desktop title font | PinCon OpenAI Sans, weight 700, size 33.06px, line height 43.9698px |
| Mobile selected cover | x=41, y=175.59375, width=308, height=308 |
| Mobile title font | PinCon OpenAI Sans, weight 700, size 26.796px, line height 35.6387px |
| Desktop settings dialog | x=341.5, y=16, width=680, height=904 |
| Desktop switches | x=910.5; y=116.25, 172.75, 229.25; 64 × 28 |
| Mobile settings dialog | x=19, y=16, width=352, height=812 |
| Mobile switches | x=268; y=117, 193, 269; 64 × 28 |
| Switch thumb | 32 × 20; enabled translation=24px |
| Switch colors | enabled RGB(0,136,255); disabled RGB(203,211,223) |
| Corner SVG strokes | 1.6px; butt line caps; miter joins |
| Settings keyboard focus | 2px solid RGB(105,127,163); offset 3px |

Document titles, types, colors, edited dates and storage status populate the original covers. The calendar groups documents by last edit date. The source notice capsule opens document management, and school account fields are replaced by search/import/backup controls. The original ＋ style remains available for personal document creation. These domain adaptations follow the personal-processor brief.

## Comparison history and fixes

- The previous inspired library was replaced with the original source hierarchy and implementation. Source geometry, caption, reflections, startup logo, corner tools and motion now come from PinCon itself. Post-fix full-view evidence: `comparison-desktop.jpg` and `comparison-mobile.png`.
- P2: switches were 15px too far right because the shorter personal settings content did not need the source scrollbar. Before: `memo-settings-desktop.jpg`, compared with `source-settings-desktop.jpg`. Fix: reserve the original scrollbar gutter. Post-fix evidence: `memo-settings-desktop-final.jpg`, both focused switch boards, and exact matching coordinates above.
- P3, resolved: old global document CSS rounded source icon strokes and changed switch keyboard-focus color. Fix: scope those document styles to document surfaces. Post-fix computed styles match the source; final mobile and settings captures include the correction.
- Functional integration: native dialogs initially placed document notifications behind their backdrop. Notifications now live inside the active dialog and move with dismissal. Actual HTML export showed a visible, accessible success message inside `#editor`.
- Functional integration: Back, Escape and backdrop dismissal now wait for successful saving. A quota-failure regression executes the application's actual save/navigation functions against rejected writes: work stays editable, the error stays inside the modal, and navigation resumes after storage recovers. Memory-only covers explicitly request a backup.

No actionable P0/P1/P2 visual findings remain. The source's scrollbar thumb is naturally absent when the personal settings content fits; the original gutter and all switch positions are retained.

## Interaction and code verification

- All three original switches: startup intro, cover lighting, and tilt-to-swipe Beta. On/off colors and thumb movement match. Startup and lighting preferences survived reload. Lighting changed the actual renderer state. Tilt used the original permission, requesting, enabled/paused and off lifecycle; test preferences were restored to on/on/off.
- Original keyboard navigation moved to the final cover with End and back to the mind map with ArrowLeft. Selected cover, caption and announcement updated together.
- Original native cover/dialog transition, close buttons, Back and Escape; final Escape verification returned to the library with `editor.open=false`.
- Cover/calendar morph, next/previous month, date agenda and opening a document from that agenda.
- Search reduced four documents to the matching comparison document; clearing it restored four covers.
- Table editing, autosave and undo restored the original cell text. Reload retained the original text and four documents.
- Flow and mind-map editors opened with their nodes/connections or parent branches. A temporary flow-label change was cancelled; the original diagram remained intact.
- Mobile document editing and return to the library. The document toolbar supports horizontal scrolling on narrow screens; all three persistent library tools remain visible.
- New-document picker exposes blank, table, flow and mind-map templates; dismissal keeps existing records.
- Actual standalone HTML download: 1,961,751 bytes, two embedded WOFF fonts, SVG and the expected mind-map labels. The completion message was visible and attached to the active editor.
- All 13 JavaScript files parse; module/HTML asset paths resolve; mirrored core-file identity and whitespace checks pass. The original storage schema and document IDs are preserved.
- No application console errors were observed. The browser extension emitted metadata-delivery errors under its own `chrome-extension://` URL; these were excluded from application errors.

Physical phone-tilt motion was not tested: the cloud browser has no real phone sensor. The deployed HTTPS app uses the original sensor code and its permission/unavailable/reduced-motion handling. No claim of hardware verification is made.

final result: passed

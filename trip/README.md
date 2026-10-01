# Seoul Day — physical paper redesign

The itinerary and the `trip-delay`, `trip-expenses`, `trip-check`, and `trip-budget` localStorage keys are preserved.

- `index.html`: semantic, responsive scrapbook structure; native expense dialog.
- `trip.css`: irregular paper skins separated from directional outer shadows, layered textures, translucent tape, metal paperclip, receipt and folded-corner details. Keyboard focus and reduced-motion support.
- `trip.js`: minute-based schedule rendering, Korean local time, expense settlement and undo, packing state, guarded storage reads and text-safe expense rendering.
- `assets/seoul-paper-collage.webp`: custom image generated with the built-in image generation tool. Prompt: overhead studio photograph of handmade Seoul construction-paper collage, Han River ferry, Namsan and Seoul Tower, visible fibers, wrinkles and contact shadows; cream, cobalt, sage, mustard and terracotta; no text.
- `assets/paper-texture.webp`: custom image generated with the built-in image generation tool. Prompt: full-bleed macro photograph of lightly crumpled then flattened off-white drawing paper, subtle irregular crease ridges and fine cellulose fibers, diffuse upper-left lighting, low contrast, no text or objects.

Both images are local WebP files. No remote font, image, framework or texture request is required. Travel times are the original user's planned itinerary, not a live transport feed. Browser departure notifications require notification permission and an active page; they are not background push notifications.

Validation: CSS parsing, asset reference checks, and six DOM behavior checks (saved data, safe expense rendering and undo, fixed timetable entries, packing persistence, trip phases, malformed stored data). Browser visual checks cover desktop and mobile layout and the expense dialog before release.

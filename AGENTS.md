# Architecture rules
- Keep photo-sizing geometry and reliability gates in the ring-sizer function's pure measurement module, with Vitest regressions under src/test; this separates arithmetic verification from unvalidated anatomical fit assumptions.
- A palm-photo result must not emit a recommended US size or inner ring diameter until an independently validated fit method replaces silhouette-width conversion; repeat AI agreement alone does not establish accuracy.
- Gate sizing-camera access with the shared device-identity helper, not viewport width, so resizing a laptop window cannot enable phone-only capture.
- Keep the sizing FAQ in a dedicated routed page using the shared header, footer, SEO and accordion components to preserve site navigation and accessible question controls.
- Render the full-screen sizing camera in a body portal above site overlays so cookie notices and parent stacking contexts cannot block its shutter or cancel controls.
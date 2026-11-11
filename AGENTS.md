# Architecture rules
- Keep photo-sizing geometry and reliability gates in the ring-sizer function's pure measurement module, with Vitest regressions under src/test; this separates arithmetic verification from unvalidated anatomical fit assumptions.
- A palm-photo result must not show shoppers a US size unless sizing_settings.show_sizes is on; a database trigger only allows that after a passing /bench run on the current chart, because untested estimates misled real users.
- Gate sizing-camera access with the shared device-identity helper, not viewport width, so resizing a laptop window cannot enable phone-only capture.
- Keep the sizing FAQ in a dedicated routed page using the shared header, footer, SEO and accordion components to preserve site navigation and accessible question controls.
- Render the full-screen sizing camera in a body portal above site overlays so cookie notices and parent stacking contexts cannot block its shutter or cancel controls.
- Keep the photo/check/fit-confirmation stages in the shared RingSizer, with automatic card detection and no manual corner step; both entry pages must use the same simple flow.

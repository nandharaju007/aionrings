# Sizing accuracy
## Phone camera walkthrough
- [x] Reproduce cookie notice covering the phone camera shutter.
- [x] Keep full-screen camera controls above site overlays without changing consent.
- [ ] Verify capture, restart, and camera-permission-denied recovery.
- [ ] Explain real-photo steps and physical US-size confirmation.

## Sizing FAQ
- [x] Add a dedicated FAQ explaining photo width, US sizes, missing smaller-finger readings, and physical fit confirmation.
- [x] Link the FAQ from photo sizing and the footer.
- [x] Verify FAQ questions and navigation in the browser on desktop and phone-sized screens.

## Accuracy validation
- [x] Remove unsupported photo-width correction and unreliable averaging.
- [x] Add deterministic geometry and repeatability checks with regression tests (19 passing checks).
- [x] Prevent shoppers treating photo output as a confirmed ring size.
- [x] Verify the live sizing request and visible result using the uploaded screenshot; no recommended US size displayed.
- [ ] Validate real-hand accuracy against known physical sizes (blocked: original photos and physical measurements).
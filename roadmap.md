# Sizing accuracy
## Pre-order email and phone submission guards
- [x] Apply sizing-kit pre-submit validation to button and keyboard submissions; invalid email and phone values generate zero native submissions and zero order requests on desktop and phone.
- [x] Check all 197 supported dial codes, including national/international formats; valid confirmation verified with an intercepted POST, without saving test orders. Azure-side validation remains outside this checkout.
## Pre-order live validation
- [x] Validate ring selections, personal details and shipping fields live, preserving layout and the existing order service.
- [x] Test invalid submissions and valid confirmation on desktop and phone; save the changes. Confirmation POST was intercepted to avoid test orders; external Azure server validation is not accessible in this checkout.
## Publish launch campaign media
- [x] Upload final corrected videos, latest product reveal and branded promotional photos.
- [x] Verify the campaign page and downloads, save changes and request publishing.
## Ship a sample kit from a delivery address
- [x] Replace email-only requests with a validated, saved shipping-address form.
- [x] Show requests to administrators and verify a real submission reads back; explain ordering after finding a size.
## Clear Show my size outcome
- [x] Explain ruler input and units; bring either the suggested US size or measurement error into view.
- [x] Verify successful results in cm and mm and visible feedback for mismatched units.
## Short paper-strip flow
- [x] Combine preparation, wrap and mark into one visual step; keep measurement and repeat check together.
- [x] Verify unit conversion, mismatched-reading protection and applying a size on phone and desktop.
## Three clear sizing options
- [x] Show kit, paper and phone camera choices together with simple visual guidance.
- [x] Collect a delivery address for an email kit request; keep availability and shipping unconfirmed.
- [x] Add editable physical chart results and verify phone/desktop flows without bypassing the camera accuracy gate.
## Simple choices and detailed wrapping
- [x] Add a sample sizing-kit email request without promising availability or delivery.
- [x] Guide paper preparation, wrapping, marking and ruler reading one step at a time; verify size selection on phone and desktop.
## Interactive measurement imagery
- [x] Replace the paper-strip drawing with realistic examples and tappable guidance.
- [x] Verify marking, ruler guidance and final size selection on phone and desktop.
## Easier measurement steps
- [x] Show one measurement input at a time with a guided repeat check and clear back navigation.
- [x] Keep optional sizing tools out of the main flow and verify phone and desktop size selection.
## Physical sizing alternative
- [x] Build a shared visual ring / paper measurement guide with repeat-reading checks.
- [x] Make it primary on pre-order, ring and sizing-kit pages; retain optional photo checking.
- [x] Verify measurements, size selection, print download and mobile layouts.
## Photo result clarity
- [x] Replace size-estimation promises with photo-check labels and distinguish an unavailable reading from a camera error.
- [x] Give photo results a direct path to the physical US size chart without recommending an unvalidated size.
- [x] Verify photo result and size-chart navigation in preview.

## Phone camera walkthrough
- [x] Reproduce cookie notice covering the phone camera shutter.
- [x] Keep full-screen camera controls above site overlays without changing consent.
- [x] Verify capture, restart, and camera-permission-denied recovery in phone simulation.
- [x] Explain real-photo steps and physical US-size confirmation.

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
## Simpler photo flow
- [x] Reduce photo sizing to photo, finger check, and physical fit confirmation.
- [x] Remove duplicate instructions and optional card-marking controls from the main flow.
- [x] Verify upload, capture, retake, result, and chart navigation on phone and desktop.

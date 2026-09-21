# Move ring experience tools to “The Ring” page

## Changes
- Remove “See it on your hand” and photo-based sizing from the Pre-Order page, including the photo tool inside its sizing pop-up.
- Keep the Pre-Order page’s standard size chart and sizing-kit guidance, with a clear link to the photo sizing experience on “The Ring” page.
- Add a prominent “Experience the ring” section immediately after the Ring page introduction, before specifications and materials.
- Present both tools side by side as highlighted actions: virtual try-on and photo size estimate, each opening its full experience only when selected.
- Keep the detailed sample-photo instructions and size chart farther down the Ring page, linked from the highlighted sizing action.

## Validation
- Confirm both tools are absent from Pre-Order and visible near the top of “The Ring.”
- Test opening, closing, and navigating to the sizing instructions on desktop and mobile.
- Check for clipping, overlap, and horizontal scrolling.

## Technical details
- Reuse the existing `RingTryOn` and `RingSizer` functionality; only placement and presentation change.
- Add controlled collapsed states where needed so the new highlighted section remains compact until a shopper chooses a tool.

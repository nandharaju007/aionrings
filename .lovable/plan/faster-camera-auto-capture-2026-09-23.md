# Faster camera auto-capture

## Goal
Make photo capture react quickly once the open hand and card are correctly framed, while avoiding premature or blurry photos.

## Changes
- Run visual checks on animation frames instead of a fixed timer so the camera reacts sooner without overlapping detector work.
- Start card-based fallback immediately while the hand detector loads, instead of making shoppers wait four seconds.
- Replace the fragile exact-edge score with a broader card-presence check around the visible guide.
- Treat hand and card confidence independently, then capture after a short stable confirmation rather than repeated perfect frames.
- Preserve progress through brief detector misses and prevent stale checks after capture or Start over.

## Verification
- Test first capture and Start over with a mocked mobile camera feed.
- Confirm automatic capture completes promptly, manual capture remains available, and no browser errors occur.
- Check the full-screen camera layout at phone and tablet sizes.

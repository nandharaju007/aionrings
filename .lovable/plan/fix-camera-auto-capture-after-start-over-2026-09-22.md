# Fix camera auto-capture after “Start over”

## Changes
- Reset every camera and photo-session state when “Start over” is selected.
- Force the live camera and hand detector to start as a fresh session each time the camera is reopened.
- Make camera cleanup fully release the previous stream and detector before another session begins.
- Verify auto-capture reaches the same ready and capture states on both the first and second attempts.

## Technical details
- Add an explicit camera-session key in the photo sizer and increment it during reset/reopen.
- Reset stale capture guards, progress, readiness, status, and detector references for each camera session.
- Use a mocked camera stream in browser testing to exercise the repeated start-over flow without requiring a physical phone camera.

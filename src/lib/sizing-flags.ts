export const FLAG_HELP: Record<string, { title: string; fix: string }> = {
  reference_missing: { title: 'No card or quarter found', fix: 'Place a bank card or a US quarter flat next to your finger, fully in view.' },
  hand_tilted: { title: 'Hand or card is tilted', fix: 'Lay your hand flat and hold the phone straight above it.' },
  finger_hidden: { title: 'Finger is hidden', fix: 'Spread your fingers so the base of the chosen finger is clearly visible.' },
  blurry: { title: 'Photo is blurry', fix: 'Hold still and tap the screen to focus before taking the photo.' },
  too_dark: { title: 'Photo is too dark', fix: 'Move to a brighter spot or near a window.' },
  inconsistent: { title: 'Readings did not agree', fix: 'Retake with the card flat and the finger edges sharp against the background.' },
};
export const formatUs = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

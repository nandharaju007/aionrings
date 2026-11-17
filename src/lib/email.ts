// Shared email validation: format check plus detection of likely mistyped
// popular domains (e.g. "abc@123gmail.co" or "sam@gamil.com" -> gmail.com).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const POPULAR_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'live.com',
  'msn.com',
  'proton.me',
  'protonmail.com',
  'me.com',
];

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = curr;
  }
  return prev[n];
}

/** Returns the likely intended domain when the email domain looks mistyped, else null. */
export function emailTypoSuggestion(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at < 0) return null;
  const domain = email.slice(at + 1).trim().toLowerCase();
  if (!domain || POPULAR_DOMAINS.includes(domain)) return null;
  // A regional variant of a known domain (e.g. gmail.com.au) is fine.
  if (POPULAR_DOMAINS.some((known) => domain.startsWith(`${known}.`))) return null;
  const label = domain.split('.')[0];
  for (const known of POPULAR_DOMAINS) {
    const knownLabel = known.split('.')[0];
    const closeDomain = editDistance(domain, known) <= 2;
    const closeLabel = editDistance(label, knownLabel) <= 1;
    const paddedLabel = label.length > knownLabel.length && label.includes(knownLabel);
    if (closeDomain || closeLabel || paddedLabel) return known;
  }
  return null;
}

// Single shape (not a union) because this project builds with
// strictNullChecks off, which disables discriminated-union narrowing.
export type EmailCheck = { ok: boolean; message?: string };

export function validateEmail(raw: string): EmailCheck {
  const email = raw.trim();
  if (!email) return { ok: false, message: 'Please enter your email address.' };
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return { ok: false, message: 'Please enter a valid email address.' };
  }
  const suggestion = emailTypoSuggestion(email);
  if (suggestion) {
    const local = email.slice(0, email.lastIndexOf('@') + 1);
    return { ok: false, message: `Did you mean ${local}${suggestion}?` };
  }
  return { ok: true };
}

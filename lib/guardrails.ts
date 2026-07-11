/**
 * Light server-side input screen. Prompt B enforces tone; this catches the
 * obvious attempts to weaponize the scan against private minors or
 * non-public people with defamatory intent. Fails gracefully — callers show
 * the generic GUARDRAIL_MESSAGE, never an error page.
 */

export const GUARDRAIL_MESSAGE =
  "We only scan public figures and willing participants. Try scanning yourself — you paid for it, after all.";

const MINOR_PATTERNS = [
  /\b(my|our)\s+(little\s+)?(brother|sister|son|daughter|kid|child)\b/i,
  /\b(is|she'?s|he'?s|they'?re)\s+(only\s+)?(1[0-7]|[1-9])\s*(years?\s*old|y\/?o)\b/i,
  /\b(middle|elementary)\s+school(er)?\b/i,
  /\bminor\b/i,
  /\b(freshman|sophomore)\s+in\s+high\s*school\b/i,
  /\bhigh\s*school\s+(freshman|sophomore|student)\b/i,
];

const DEFAMATION_PATTERNS = [
  /\b(expose|destroy|ruin|humiliate|get\s+back\s+at|revenge)\b.{0,40}\b(him|her|them|this\s+(guy|girl|person))\b/i,
  /\bwrite\s+that\s+(he|she|they)\s+(is|are|did)\b/i,
  /\b(say|claim|pretend)\s+(he|she|they)\s+(stole|cheated|assaulted|harassed)\b/i,
  /\b(stole|cheated\s+on|assaulted|harassed|abused)\b.{0,40}\b(say|write|put|include)\b/i,
];

export function screenInput(name: string, context: string): boolean {
  const combined = `${name}\n${context}`;

  if (name.trim().length < 2 || name.length > 120) return false;
  for (const p of MINOR_PATTERNS) if (p.test(combined)) return false;
  for (const p of DEFAMATION_PATTERNS) if (p.test(combined)) return false;

  return true;
}

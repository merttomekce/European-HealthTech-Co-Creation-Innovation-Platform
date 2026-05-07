export const FORBIDDEN_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'protonmail.com',
  'aol.com',
  'live.com',
  'msn.com',
  'yandex.com',
  'mail.com',
  'gmx.com',
  'me.com'
];

export function isProfessionalEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return !FORBIDDEN_DOMAINS.includes(domain);
}

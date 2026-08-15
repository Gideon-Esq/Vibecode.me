/**
 * Guards post-auth redirects: only same-site paths are accepted, so a crafted
 * `?next=https://evil.example` cannot turn the login page into an open redirect.
 */
export function safeNext(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}

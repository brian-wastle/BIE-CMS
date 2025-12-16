const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
const PATH_ID_PREFIXES = new Set(['shorts', 'embed', 'watch', 'live']);

/**
 * Extracts the canonical 11 character YouTube video id from a url or raw id input.
 * Returns an empty string when the value cannot be parsed.
 */
export function extractYoutubeId(input: string | null | undefined): string {
  const value = (input ?? '').trim();
  if (!value) {
    return '';
  }

  let id = '';

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (host === 'youtu.be' && segments[0]) {
      id = segments[0];
    } else if (host.includes('youtube.com')) {
      const searchId = parsed.searchParams.get('v');
      if (searchId) {
        id = searchId;
      } else if (segments.length >= 2) {
        const [first, second] = segments;
        if (PATH_ID_PREFIXES.has(first) && second) {
          id = second;
        } else {
          id = segments[segments.length - 1] ?? '';
        }
      }
    }
  } catch {
    // Ignore URL parsing errors and fall back to regexes/raw id check
  }

  if (!id) {
    const regexMatchers = [
      /youtu\.be\/([^?&#/]+)/i,
      /youtube\.com\/shorts\/([^?&#/]+)/i,
      /youtube\.com\/embed\/([^?&#/]+)/i,
      /youtube\.com\/watch\?[^#]*v=([^?&#/]+)/i,
      /[?&]v=([^?&#/]+)/i,
    ];
    for (const pattern of regexMatchers) {
      const match = value.match(pattern);
      if (match?.[1]) {
        id = match[1];
        break;
      }
    }
  }

  if (!id && YOUTUBE_ID_PATTERN.test(value)) {
    id = value;
  }

  return YOUTUBE_ID_PATTERN.test(id) ? id : '';
}

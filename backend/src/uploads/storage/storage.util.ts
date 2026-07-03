import { extname } from 'node:path';

const MIME_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/** Pick a safe file extension from the mimetype, falling back to the filename. */
export function imageExtension(mimetype: string, originalName: string): string {
  const fromMime = MIME_EXTENSIONS[mimetype];
  if (fromMime) return fromMime;
  const fromName = extname(originalName).replace('.', '').toLowerCase();
  return fromName || 'bin';
}

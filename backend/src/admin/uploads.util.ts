import * as fs from 'fs';
import * as path from 'path';

export function ensureDir(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

export function uploadsVideosDir(): string {
  return path.join(process.cwd(), 'uploads', 'videos');
}

export function safeExtFromMime(mime: string | undefined): string {
  const m = (mime ?? '').toLowerCase();
  if (m === 'video/mp4') return '.mp4';
  if (m === 'video/quicktime') return '.mov';
  if (m === 'video/webm') return '.webm';
  return '.mp4';
}

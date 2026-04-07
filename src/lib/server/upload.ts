import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { env } from '$env/dynamic/private';

export const UPLOAD_DIR = env.UPLOAD_DIR ?? 'uploads';

const MAX_BYTES = 20 * 1024 * 1024; // 20MB
const ALLOWED = new Set([
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'application/pdf',
	'video/mp4',
	'application/zip'
]);

export function ensureUploadDir() {
	if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function safeMime(type: string | null): type is string {
	return !!type && ALLOWED.has(type);
}

export function extFromMime(mime: string): string {
	const map: Record<string, string> = {
		'image/jpeg': '.jpg',
		'image/png': '.png',
		'image/gif': '.gif',
		'image/webp': '.webp',
		'application/pdf': '.pdf',
		'video/mp4': '.mp4',
		'application/zip': '.zip'
	};
	return map[mime] ?? '.bin';
}

export function saveUploadBuffer(buffer: Buffer, mime: string, maxBytes = MAX_BYTES): { storedName: string } {
	if (buffer.length > maxBytes) throw new Error('文件过大');
	if (!safeMime(mime)) throw new Error('不支持的文件类型');
	ensureUploadDir();
	const id = randomUUID();
	const ext = extFromMime(mime);
	const storedName = `${id}${ext}`;
	const destPath = join(UPLOAD_DIR, storedName);
	writeFileSync(destPath, buffer);
	return { storedName };
}

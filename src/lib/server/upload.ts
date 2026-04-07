import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { env } from '$env/dynamic/private';

export const UPLOAD_DIR = env.UPLOAD_DIR ?? 'uploads';

const MAX_BYTES = 25 * 1024 * 1024; // 25MB（docx/音频略大）
const ALLOWED = new Set([
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'application/pdf',
	'video/mp4',
	'application/zip',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'audio/mpeg',
	'audio/mp3'
]);

export function ensureUploadDir() {
	if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function safeMime(type: string | null): type is string {
	if (!type) return false;
	if (ALLOWED.has(type)) return true;
	/* 部分浏览器对 mp3 使用 audio/mp3 */
	if (type === 'audio/mp3') return true;
	return false;
}

export function extFromMime(mime: string): string {
	const map: Record<string, string> = {
		'image/jpeg': '.jpg',
		'image/png': '.png',
		'image/gif': '.gif',
		'image/webp': '.webp',
		'application/pdf': '.pdf',
		'video/mp4': '.mp4',
		'application/zip': '.zip',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
		'audio/mpeg': '.mp3',
		'audio/mp3': '.mp3'
	};
	return map[mime] ?? '.bin';
}

export function saveUploadBuffer(buffer: Buffer, mime: string, maxBytes = MAX_BYTES): { storedName: string } {
	if (buffer.length > maxBytes) throw new Error('文件过大');
	if (!safeMime(mime)) throw new Error('不支持的文件类型（支持图片、DOCX、MP3 等）');
	ensureUploadDir();
	const id = randomUUID();
	const ext = extFromMime(mime);
	const storedName = `${id}${ext}`;
	const destPath = join(UPLOAD_DIR, storedName);
	writeFileSync(destPath, buffer);
	return { storedName };
}

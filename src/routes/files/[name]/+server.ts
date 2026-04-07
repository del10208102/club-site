import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { UPLOAD_DIR } from '$lib/server/upload';
import { getWorkByStoredName } from '$lib/server/store';

const mimeMap: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.pdf': 'application/pdf',
	'.mp4': 'video/mp4',
	'.zip': 'application/zip'
};

export const GET: RequestHandler = ({ params }) => {
	const name = params.name;
	if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) error(404, 'Not found');
	const row = getWorkByStoredName(name);
	if (!row) error(404, 'Not found');
	const path = join(UPLOAD_DIR, name);
	if (!existsSync(path)) error(404, 'Not found');
	const buf = readFileSync(path);
	const ext = name.slice(name.lastIndexOf('.'));
	const type = mimeMap[ext.toLowerCase()] ?? row.mime;
	return new Response(buf, {
		headers: {
			'Content-Type': type,
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

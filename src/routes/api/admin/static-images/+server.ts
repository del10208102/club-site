import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const IMG_EXT = /\.(jpe?g|png|gif|webp|svg|avif)$/i;

export const GET: RequestHandler = ({ locals }) => {
	if (!locals.admin) error(403, '需要管理员登录');
	const dir = join(process.cwd(), 'static', 'images');
	if (!existsSync(dir)) return json({ files: [] as string[] });
	const names = readdirSync(dir).filter((n) => {
		try {
			if (!IMG_EXT.test(n)) return false;
			return statSync(join(dir, n)).isFile();
		} catch {
			return false;
		}
	});
	const files = names.sort().map((n) => `/images/${encodeURIComponent(n)}`);
	return json({ files });
};

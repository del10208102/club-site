import type { PageServerLoad } from './$types';
import { getHomeCarousel } from '$lib/server/store';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const IMG_EXT = /\.(jpe?g|png|gif|webp|svg|avif)$/i;

export const load: PageServerLoad = () => {
	const carousel = getHomeCarousel();
	const dir = join(process.cwd(), 'static', 'images');
	let staticImages: string[] = [];
	if (existsSync(dir)) {
		staticImages = readdirSync(dir)
			.filter((n) => {
				try {
					if (!IMG_EXT.test(n)) return false;
					return statSync(join(dir, n)).isFile();
				} catch {
					return false;
				}
			})
			.sort()
			.map((n) => `/images/${encodeURIComponent(n)}`);
	}
	return { carousel, staticImages };
};

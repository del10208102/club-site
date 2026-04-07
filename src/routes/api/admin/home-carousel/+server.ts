import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getHomeCarousel, setHomeCarousel, type CarouselSlide } from '$lib/server/store';
import { randomUUID } from 'node:crypto';

function sanitizeSlide(raw: unknown): CarouselSlide | null {
	if (!raw || typeof raw !== 'object') return null;
	const o = raw as Record<string, unknown>;
	const image = typeof o.image === 'string' ? o.image.trim() : '';
	if (!image || image.includes('..')) return null;
	if (!image.startsWith('/files/') && !image.startsWith('/images/')) return null;
	const id = typeof o.id === 'string' && o.id ? o.id : randomUUID();
	const slide: CarouselSlide = { id, image };
	if (typeof o.title === 'string' && o.title.trim()) slide.title = o.title.trim().slice(0, 120);
	if (typeof o.subtitle === 'string' && o.subtitle.trim()) slide.subtitle = o.subtitle.trim().slice(0, 200);
	if (typeof o.href === 'string' && o.href.trim()) {
		const h = o.href.trim();
		if (h.startsWith('/') && !h.startsWith('//')) slide.href = h.slice(0, 500);
	}
	return slide;
}

export const GET: RequestHandler = ({ locals }) => {
	if (!locals.admin) error(403, '需要管理员登录');
	return json(getHomeCarousel());
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.admin) error(403, '需要管理员登录');
	const body = await request.json().catch(() => ({}));
	const slidesIn = body?.slides;
	const interval_ms = Number(body?.interval_ms);
	if (!Array.isArray(slidesIn)) error(400, 'slides 须为数组');
	const slides: CarouselSlide[] = [];
	for (const s of slidesIn) {
		const one = sanitizeSlide(s);
		if (one) slides.push(one);
	}
	setHomeCarousel(slides, interval_ms);
	return json({ ok: true });
};

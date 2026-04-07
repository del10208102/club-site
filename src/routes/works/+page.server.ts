import type { PageServerLoad } from './$types';
import { listWorks } from '$lib/server/store';
import { makeExcerpt } from '$lib/server/plain-html';

export const load: PageServerLoad = () => {
	const items = listWorks().map((w) => ({
		...w,
		list_excerpt:
			w.excerpt?.trim() ||
			(w.description?.trim() ? makeExcerpt(w.description, 140) : '') ||
			(w.content_html ? makeExcerpt(w.content_html.replace(/<[^>]+>/g, ' '), 140) : '') ||
			'点击查看详情'
	}));
	return { items };
};

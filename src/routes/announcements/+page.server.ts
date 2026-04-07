import type { PageServerLoad } from './$types';
import { listAnnouncements } from '$lib/server/store';
import { makeExcerpt } from '$lib/server/plain-html';

export const load: PageServerLoad = () => {
	const items = listAnnouncements().map((a) => ({
		...a,
		list_excerpt: makeExcerpt(a.body_html.replace(/<[^>]+>/g, ' '), 180)
	}));
	return { items };
};

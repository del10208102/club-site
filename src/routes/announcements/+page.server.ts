import type { PageServerLoad } from './$types';
import { listAnnouncements } from '$lib/server/store';

export const load: PageServerLoad = () => {
	return { items: listAnnouncements() };
};

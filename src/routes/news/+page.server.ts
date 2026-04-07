import type { PageServerLoad } from './$types';
import { listNews } from '$lib/server/store';

export const load: PageServerLoad = () => {
	return { items: listNews() };
};

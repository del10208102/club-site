import type { PageServerLoad } from './$types';
import { listWorks } from '$lib/server/store';

export const load: PageServerLoad = () => {
	return { items: listWorks() };
};

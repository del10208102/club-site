import type { PageServerLoad } from './$types';
import { getRecruit } from '$lib/server/store';

export const load: PageServerLoad = () => {
	return getRecruit();
};

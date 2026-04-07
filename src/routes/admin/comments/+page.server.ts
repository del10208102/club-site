import type { PageServerLoad } from './$types';
import { listPendingCommentsForAdmin } from '$lib/server/store';

export const load: PageServerLoad = () => {
	return { pending: listPendingCommentsForAdmin() };
};

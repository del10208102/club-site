import type { PageServerLoad } from './$types';
import { listWorks } from '$lib/server/store';
import { canManageWork } from '$lib/server/permissions';

export const load: PageServerLoad = ({ locals }) => {
	const items = listWorks().map((w) => ({
		...w,
		can_manage: canManageWork(locals.adminUser ?? '', w)
	}));
	return { items };
};

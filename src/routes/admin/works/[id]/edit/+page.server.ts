import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getWorkById } from '$lib/server/store';
import { canManageWork } from '$lib/server/permissions';

export const load: PageServerLoad = ({ params, locals }) => {
	if (!locals.admin) redirect(303, '/login?redirectTo=/admin');
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(404, '未找到');
	const work = getWorkById(id);
	if (!work) error(404, '未找到');
	if (!canManageWork(locals.adminUser ?? '', work)) {
		redirect(303, '/admin/works');
	}
	return { work };
};

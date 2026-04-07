import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAnnouncementById } from '$lib/server/store';

export const load: PageServerLoad = ({ params, locals }) => {
	if (!locals.admin) redirect(303, '/login');
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(404, '未找到');
	const item = getAnnouncementById(id);
	if (!item) error(404, '未找到');
	return { item };
};

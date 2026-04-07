import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getNewsById } from '$lib/server/store';

export const load: PageServerLoad = ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id < 1) error(404, '未找到');
	const item = getNewsById(id);
	if (!item) error(404, '未找到');
	return { item };
};

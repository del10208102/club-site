import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getWorkById,
	getWorkLikeCount,
	listApprovedCommentsForWork,
	userHasLikedWork
} from '$lib/server/store';

export const load: PageServerLoad = ({ params, locals }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id < 1) error(404, '未找到');
	const work = getWorkById(id);
	if (!work) error(404, '未找到');
	const likesCount = getWorkLikeCount(id);
	const likedByMe = locals.guest ? userHasLikedWork(id, locals.guest.id) : false;
	const comments = listApprovedCommentsForWork(id);
	return {
		work,
		admin: locals.admin,
		guest: locals.guest,
		social: { likesCount, likedByMe, comments }
	};
};

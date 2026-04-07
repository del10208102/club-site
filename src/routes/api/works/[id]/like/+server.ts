import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getWorkById, toggleWorkLike } from '$lib/server/store';

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.guest) error(401, '请先登录访客账号后再点赞');
	const workId = Number(params.id);
	if (!Number.isInteger(workId) || workId < 1) error(400, '无效作品');
	if (!getWorkById(workId)) error(404, '未找到');

	const r = toggleWorkLike(workId, locals.guest.id);
	return json({ ok: true, liked: r.liked, count: r.count });
};

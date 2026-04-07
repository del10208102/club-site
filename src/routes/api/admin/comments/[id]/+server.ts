import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCommentById, setCommentStatus, type CommentStatus } from '$lib/server/store';

export const PATCH: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.admin) error(403, '需要管理员登录');
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(400, '无效 ID');
	const c = getCommentById(id);
	if (!c) error(404, '未找到');

	const body = await request.json().catch(() => ({}));
	const status = body.status as CommentStatus;
	if (status !== 'approved' && status !== 'rejected') error(400, 'status 须为 approved 或 rejected');

	const ok = setCommentStatus(id, status);
	if (!ok) error(500, '更新失败');
	return json({ ok: true });
};

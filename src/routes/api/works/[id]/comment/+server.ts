import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addWorkComment, getWorkById } from '$lib/server/store';
import { sanitizeCommentBody } from '$lib/server/guest-auth';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.guest) error(401, '请先登录访客账号后再评论');
	const workId = Number(params.id);
	if (!Number.isInteger(workId) || workId < 1) error(400, '无效作品');
	if (!getWorkById(workId)) error(404, '未找到');

	const body = await request.json().catch(() => ({}));
	const raw = typeof body.body === 'string' ? body.body : '';
	const text = sanitizeCommentBody(raw);
	if (!text) error(400, '评论不能为空');

	const id = addWorkComment(workId, locals.guest.id, text);
	return json({ ok: true, id, message: '评论已提交，管理员审核通过后将显示。' });
};

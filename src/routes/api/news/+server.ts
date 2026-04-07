import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listNews, addNews } from '$lib/server/store';

export const GET: RequestHandler = () => {
	return json({ items: listNews() });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.admin) error(403, '需要管理员登录');
	const form = await request.formData();
	const title = String(form.get('title') ?? '').trim();
	const summary = String(form.get('summary') ?? '').trim();
	const body = String(form.get('body') ?? '').trim();
	const cover_image = String(form.get('cover_image') ?? '').trim();
	if (!title) error(400, '标题不能为空');
	if (!body) error(400, '正文不能为空');
	const id = addNews(title, summary || title.slice(0, 80), body, cover_image || undefined);
	return json({ ok: true, id });
};
